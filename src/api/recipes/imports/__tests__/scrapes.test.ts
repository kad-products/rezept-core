import { beforeEach, describe, expect, it, vi } from 'vitest';
import type RzLogger from '@/logger';
import Logger from '@/logger';

const mockEnv = vi.hoisted(() => ({
	REZEPT_ENV: 'development' as string,
	rezept_recipe_uploads: {
		put: vi.fn(),
	},
}));

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

vi.mock('@/steps', () => ({
	parseBodyJson: vi.fn(),
	initializeScrape: vi.fn(),
	transformScrapeToRecipe: vi.fn(),
	validateAsRecipe: vi.fn(),
	saveRecipe: vi.fn(),
	saveRecipeSections: vi.fn(),
	saveRecipeInstructions: vi.fn(),
	saveRecipeIngredients: vi.fn(),
}));

vi.mock('@/repositories', () => ({
	updateRecipeScrapeStatus: vi.fn(),
}));

vi.mock('@/interrupters', () => ({
	requireAuthentication: vi.fn(),
	requirePermissions: vi.fn(() => vi.fn()),
}));

import { RzStepError } from '@/classes';
import { requireAuthentication } from '@/interrupters';
import { updateRecipeScrapeStatus } from '@/repositories';
import {
	initializeScrape,
	parseBodyJson,
	saveRecipe,
	saveRecipeIngredients,
	saveRecipeInstructions,
	saveRecipeSections,
	transformScrapeToRecipe,
	validateAsRecipe,
} from '@/steps';
import handler, { _postHandler } from '../scrapes';

const makeRequest = (body: unknown = { url: 'https://example.com/recipe' }) =>
	new Request('https://example.com/api/recipes/imports/scrapes', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(body),
	});

const mockScrape = {
	id: 'scrape-id',
	status: 'INITIALIZED',
	createdAt: new Date().toISOString(),
	updatedAt: null,
	createdBy: 'user-id',
};

const mockTransformedRecipe = { title: 'Transformed Recipe' };

const mockValidatedRecipe = {
	title: 'Test Recipe',
	authorId: 'user-id',
	sections: [
		{
			instructions: [{ stepNumber: 1, instruction: 'Mix everything' }],
			ingredients: [{ raw: 'flour' }],
		},
	],
};

const mockSavedRecipe = { id: 'recipe-id', title: 'Test Recipe' };

const mockSavedSections = [{ id: 'section-id' }];

describe('_postHandler', () => {
	let ctx: { user: { id: string }; logger: RzLogger };

	beforeEach(() => {
		vi.clearAllMocks();
		ctx = { user: { id: 'user-id' }, logger: new Logger() };

		vi.mocked(parseBodyJson).mockResolvedValue({ url: 'https://example.com/recipe' } as any);
		vi.mocked(initializeScrape).mockResolvedValue(mockScrape as any);
		vi.mocked(transformScrapeToRecipe).mockResolvedValue(mockTransformedRecipe as any);
		vi.mocked(validateAsRecipe).mockResolvedValue(mockValidatedRecipe as any);
		vi.mocked(saveRecipe).mockResolvedValue(mockSavedRecipe as any);
		vi.mocked(saveRecipeSections).mockResolvedValue(mockSavedSections as any);
		vi.mocked(saveRecipeInstructions).mockResolvedValue({} as any);
		vi.mocked(saveRecipeIngredients).mockResolvedValue({} as any);
		vi.mocked(updateRecipeScrapeStatus).mockResolvedValue(undefined as any);
	});

	describe('happy path', () => {
		it('returns success when all steps complete', async () => {
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(response.status).toBe(200);
			const body = (await response.json()) as any;
			expect(body.success).toBe(true);
		});

		it('calls all steps in order with the correct arguments', async () => {
			await _postHandler({ request: makeRequest(), ctx } as any);
			expect(parseBodyJson).toHaveBeenCalledBefore(initializeScrape as any);
			expect(initializeScrape).toHaveBeenCalledBefore(transformScrapeToRecipe as any);
			expect(transformScrapeToRecipe).toHaveBeenCalledBefore(validateAsRecipe as any);
			expect(validateAsRecipe).toHaveBeenCalledBefore(saveRecipe as any);
			expect(saveRecipe).toHaveBeenCalledBefore(saveRecipeSections as any);
			expect(saveRecipeSections).toHaveBeenCalledBefore(saveRecipeInstructions as any);
			expect(saveRecipeInstructions).toHaveBeenCalledBefore(saveRecipeIngredients as any);
		});

		it('updates scrape status after each successful step', async () => {
			await _postHandler({ request: makeRequest(), ctx } as any);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledTimes(6);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith(
				'scrape-id',
				'TRANSFORMED',
				expect.any(String),
				'user-id',
				expect.anything(),
			);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith(
				'scrape-id',
				'VALIDATED',
				expect.any(String),
				'user-id',
				expect.anything(),
			);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith(
				'scrape-id',
				'RECIPE_SAVED',
				expect.any(String),
				'user-id',
				expect.anything(),
			);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith(
				'scrape-id',
				'SECTIONS_SAVED',
				expect.any(String),
				'user-id',
				expect.anything(),
			);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith(
				'scrape-id',
				'INSTRUCTIONS_SAVED',
				expect.any(String),
				'user-id',
				expect.anything(),
			);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith(
				'scrape-id',
				'INGREDIENTS_SAVED',
				expect.any(String),
				'user-id',
				expect.anything(),
			);
		});

		it('maps instructions and ingredients to their saved section IDs', async () => {
			await _postHandler({ request: makeRequest(), ctx } as any);
			expect(saveRecipeInstructions).toHaveBeenCalledWith(
				'recipe-id',
				[{ sectionId: 'section-id', instructions: mockValidatedRecipe.sections[0].instructions }],
				'user-id',
				expect.anything(),
			);
			expect(saveRecipeIngredients).toHaveBeenCalledWith(
				'recipe-id',
				[{ sectionId: 'section-id', ingredients: mockValidatedRecipe.sections[0].ingredients }],
				'user-id',
				expect.anything(),
			);
		});
	});

	describe('error handling', () => {
		it('does not update scrape status to FAILED when parseBodyJson fails (scrape not yet created)', async () => {
			vi.mocked(parseBodyJson).mockRejectedValue(new RzStepError(400, 'Invalid JSON', 'Invalid JSON'));
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(updateRecipeScrapeStatus).not.toHaveBeenCalledWith(
				expect.anything(),
				'FAILED',
				expect.anything(),
				expect.anything(),
				expect.anything(),
			);
			expect(response.status).toBe(400);
		});

		it('does not update scrape status to FAILED when initializeScrape fails (scrape not yet created)', async () => {
			vi.mocked(initializeScrape).mockRejectedValue(new RzStepError(500, 'DB error', 'DB error'));
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(updateRecipeScrapeStatus).not.toHaveBeenCalledWith(
				expect.anything(),
				'FAILED',
				expect.anything(),
				expect.anything(),
				expect.anything(),
			);
			expect(response.status).toBe(500);
		});

		it('marks scrape as FAILED when transformScrapeToRecipe fails', async () => {
			vi.mocked(transformScrapeToRecipe).mockRejectedValue(new RzStepError(422, 'Transform failed', 'Transform failed'));
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith(
				'scrape-id',
				'FAILED',
				'Transform failed',
				'user-id',
				expect.anything(),
			);
			expect(response.status).toBe(422);
		});

		it('marks scrape as FAILED when validateAsRecipe fails', async () => {
			vi.mocked(validateAsRecipe).mockRejectedValue(new RzStepError(422, 'Validation failed', 'Validation failed'));
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith(
				'scrape-id',
				'FAILED',
				'Validation failed',
				'user-id',
				expect.anything(),
			);
			expect(response.status).toBe(422);
		});

		it('marks scrape as FAILED when saveRecipe fails', async () => {
			vi.mocked(saveRecipe).mockRejectedValue(new RzStepError(500, 'Save failed', 'Save failed'));
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith('scrape-id', 'FAILED', 'Save failed', 'user-id', expect.anything());
			expect(response.status).toBe(500);
		});

		it('marks scrape as FAILED when saveRecipeSections fails', async () => {
			vi.mocked(saveRecipeSections).mockRejectedValue(new RzStepError(500, 'Sections failed', 'Sections failed'));
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith(
				'scrape-id',
				'FAILED',
				'Sections failed',
				'user-id',
				expect.anything(),
			);
			expect(response.status).toBe(500);
		});

		it('marks scrape as FAILED when saveRecipeInstructions fails', async () => {
			vi.mocked(saveRecipeInstructions).mockRejectedValue(new RzStepError(500, 'Instructions failed', 'Instructions failed'));
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith(
				'scrape-id',
				'FAILED',
				'Instructions failed',
				'user-id',
				expect.anything(),
			);
			expect(response.status).toBe(500);
		});

		it('marks scrape as FAILED when saveRecipeIngredients fails', async () => {
			vi.mocked(saveRecipeIngredients).mockRejectedValue(new RzStepError(500, 'Ingredients failed', 'Ingredients failed'));
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith(
				'scrape-id',
				'FAILED',
				'Ingredients failed',
				'user-id',
				expect.anything(),
			);
			expect(response.status).toBe(500);
		});

		it('returns the step error status code', async () => {
			vi.mocked(transformScrapeToRecipe).mockRejectedValue(new RzStepError(403, 'Forbidden', 'Forbidden'));
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(response.status).toBe(403);
			const body = (await response.json()) as any;
			expect(body.success).toBe(false);
			expect(body.error).toBe('Forbidden');
		});
	});
});

describe('route handler', () => {
	const executeChain = async (requestInfo: any): Promise<Response | undefined> => {
		for (const fn of handler.post) {
			const result = await (fn as (info: unknown) => Promise<Response | undefined>)(requestInfo);
			if (result instanceof Response) return result;
		}
	};

	let ctx: any;
	let authCheck: ReturnType<typeof vi.fn>;
	let permissionCheck: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(parseBodyJson).mockResolvedValue({ url: 'https://example.com/recipe' } as any);
		vi.mocked(initializeScrape).mockResolvedValue(mockScrape as any);
		vi.mocked(transformScrapeToRecipe).mockResolvedValue(mockTransformedRecipe as any);
		vi.mocked(validateAsRecipe).mockResolvedValue(mockValidatedRecipe as any);
		vi.mocked(saveRecipe).mockResolvedValue(mockSavedRecipe as any);
		vi.mocked(saveRecipeSections).mockResolvedValue(mockSavedSections as any);
		vi.mocked(saveRecipeInstructions).mockResolvedValue({} as any);
		vi.mocked(saveRecipeIngredients).mockResolvedValue({} as any);
		vi.mocked(updateRecipeScrapeStatus).mockResolvedValue(undefined as any);
		authCheck = handler.post[0] as ReturnType<typeof vi.fn>;
		vi.mocked(authCheck).mockReturnValue(undefined); // passes through by default
		// handler.post[1] is the function returned by requirePermissions() at module init
		permissionCheck = handler.post[1] as ReturnType<typeof vi.fn>;
		vi.mocked(permissionCheck).mockResolvedValue(undefined); // passes through by default
		ctx = { user: { id: 'user-id' }, logger: new Logger() };
	});

	it('handler chain ends with _postHandler', () => {
		expect(handler.post[handler.post.length - 1]).toBe(_postHandler);
	});

	it('includes requireAuthentication in the chain', () => {
		expect(handler.post).toContain(requireAuthentication);
	});

	it('returns 401 for unauthenticated requests', async () => {
		vi.mocked(authCheck).mockReturnValueOnce(Response.json({ error: 'Unauthorized' }, { status: 401 }));
		const response = await executeChain({ request: makeRequest(), ctx: { ...ctx, user: null } });
		expect(response?.status).toBe(401);
	});

	it('blocks the request when the permission check fails', async () => {
		const forbidden = Response.json({ success: false, error: 'Forbidden' }, { status: 403 });
		vi.mocked(permissionCheck).mockResolvedValue(forbidden);
		const response = await executeChain({ request: makeRequest(), ctx });
		expect(response?.status).toBe(403);
	});

	it('reaches _postHandler when auth and permissions pass', async () => {
		const response = await executeChain({ request: makeRequest(), ctx });
		expect(response?.status).toBe(200);
		const body = (await response?.json()) as any;
		expect(body.success).toBe(true);
	});
});
