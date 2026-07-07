import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createNoopLogger } from '@/logger';
import type { RzLogger } from '@/types';

const mockEnv = vi.hoisted(() => ({
	REZEPT_ENV: 'development' as string,
	REZEPT_RECIPE_UPLOADS: {
		put: vi.fn(),
	},
	REZEPT_RECIPE_SCRAPES: {
		put: vi.fn(),
		delete: vi.fn(),
	},
	RECIPE_SCRAPE_COVER_IMAGE_RETRY_WORKFLOW: {
		get: vi.fn(),
		create: vi.fn(),
	},
}));

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

vi.mock('@/analytics', () => ({
	trackScrapeAttempt: vi.fn(),
}));

vi.mock('@/steps', () => ({
	parseBodyJson: vi.fn(),
	initializeScrape: vi.fn(),
	transformScrapeToRecipe: vi.fn(),
	fetchAndStoreCoverImage: vi.fn(),
	validateAsRecipe: vi.fn(),
	saveRecipe: vi.fn(),
	saveRecipeSections: vi.fn(),
	saveRecipeCookingMethods: vi.fn(),
	saveRecipeIngredients: vi.fn(),
}));

vi.mock('@/repositories', () => ({
	createRecipeScrapeAttempt: vi.fn(),
	updateRecipeScrapeStatus: vi.fn(),
	linkRecipeScrapeToRecipe: vi.fn(),
}));

vi.mock('@/interrupters', () => ({
	requireAuthentication: vi.fn(),
	requirePermissions: vi.fn(() => vi.fn()),
}));

import { trackScrapeAttempt } from '@/analytics';
import { RzStepError } from '@/classes';
import { requireAuthentication } from '@/interrupters';
import { createRecipeScrapeAttempt, linkRecipeScrapeToRecipe, updateRecipeScrapeStatus } from '@/repositories';
import {
	fetchAndStoreCoverImage,
	initializeScrape,
	parseBodyJson,
	saveRecipe,
	saveRecipeCookingMethods,
	saveRecipeIngredients,
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
			cookingMethods: [{ name: 'Standard', order: 1, instructions: [{ stepNumber: 1, instruction: 'Mix everything' }] }],
			ingredients: [{ raw: 'flour' }],
		},
	],
};

const mockSavedRecipe = { id: 'recipe-id', title: 'Test Recipe' };
const mockImage = { id: 'image-001' };

const mockSavedSections = [{ id: 'section-id' }];

describe('_postHandler', () => {
	let ctx: { user: { id: string }; logger: RzLogger };

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv('VITE_APP_VERSION', 'test-version');
		ctx = { user: { id: 'user-id' }, logger: createNoopLogger() };

		vi.mocked(parseBodyJson).mockResolvedValue({ url: 'https://example.com/recipe' } as any);
		vi.mocked(initializeScrape).mockResolvedValue(mockScrape as any);
		vi.mocked(transformScrapeToRecipe).mockResolvedValue(mockTransformedRecipe as any);
		vi.mocked(fetchAndStoreCoverImage).mockResolvedValue(mockImage as any);
		vi.mocked(validateAsRecipe).mockResolvedValue(mockValidatedRecipe as any);
		vi.mocked(saveRecipe).mockResolvedValue(mockSavedRecipe as any);
		vi.mocked(saveRecipeSections).mockResolvedValue(mockSavedSections as any);
		vi.mocked(saveRecipeCookingMethods).mockResolvedValue(undefined);
		vi.mocked(saveRecipeIngredients).mockResolvedValue({} as any);
		vi.mocked(createRecipeScrapeAttempt).mockResolvedValue(undefined as any);
		vi.mocked(updateRecipeScrapeStatus).mockResolvedValue(mockScrape as any);
		vi.mocked(linkRecipeScrapeToRecipe).mockResolvedValue(undefined as any);
		mockEnv.RECIPE_SCRAPE_COVER_IMAGE_RETRY_WORKFLOW.get.mockResolvedValue(null);
		mockEnv.RECIPE_SCRAPE_COVER_IMAGE_RETRY_WORKFLOW.create.mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
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
			expect(saveRecipeSections).toHaveBeenCalledBefore(saveRecipeCookingMethods as any);
			expect(saveRecipeCookingMethods).toHaveBeenCalledBefore(saveRecipeIngredients as any);
		});

		it('updates scrape status after each successful step', async () => {
			await _postHandler({ request: makeRequest(), ctx } as any);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledTimes(7);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith('scrape-id', 'TRANSFORMED', null, 'user-id', expect.anything());
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith('scrape-id', 'VALIDATED', null, 'user-id', expect.anything());
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith('scrape-id', 'RECIPE_SAVED', null, 'user-id', expect.anything());
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith('scrape-id', 'SECTIONS_SAVED', null, 'user-id', expect.anything());
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith(
				'scrape-id',
				'COOKING_METHODS_SAVED',
				null,
				'user-id',
				expect.anything(),
			);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith('scrape-id', 'INGREDIENTS_SAVED', null, 'user-id', expect.anything());
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith('scrape-id', 'COMPLETED', null, 'user-id', expect.anything());
		});

		it('writes one attempt record on success with COMPLETED status', async () => {
			await _postHandler({ request: makeRequest(), ctx } as any);
			expect(createRecipeScrapeAttempt).toHaveBeenCalledTimes(1);
			expect(createRecipeScrapeAttempt).toHaveBeenCalledWith(
				'scrape-id',
				'api',
				null,
				'COMPLETED',
				null,
				'test-version',
				'user-id',
				expect.anything(),
			);
		});

		it('maps cooking methods and ingredients to their saved section IDs', async () => {
			await _postHandler({ request: makeRequest(), ctx } as any);
			expect(saveRecipeCookingMethods).toHaveBeenCalledWith(
				'recipe-id',
				[{ sectionId: 'section-id', cookingMethods: mockValidatedRecipe.sections[0].cookingMethods }],
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
			expect(createRecipeScrapeAttempt).not.toHaveBeenCalled();
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
			expect(createRecipeScrapeAttempt).not.toHaveBeenCalled();
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
			expect(createRecipeScrapeAttempt).toHaveBeenCalledWith(
				'scrape-id',
				'api',
				null,
				'FAILED',
				'Transform failed',
				'test-version',
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
			expect(createRecipeScrapeAttempt).toHaveBeenCalledWith(
				'scrape-id',
				'api',
				null,
				'FAILED',
				'Validation failed',
				'test-version',
				'user-id',
				expect.anything(),
			);
			expect(response.status).toBe(422);
		});

		it('marks scrape as FAILED when saveRecipe fails', async () => {
			vi.mocked(saveRecipe).mockRejectedValue(new RzStepError(500, 'Save failed', 'Save failed'));
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith('scrape-id', 'FAILED', 'Save failed', 'user-id', expect.anything());
			expect(createRecipeScrapeAttempt).toHaveBeenCalledWith(
				'scrape-id',
				'api',
				null,
				'FAILED',
				'Save failed',
				'test-version',
				'user-id',
				expect.anything(),
			);
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
			expect(createRecipeScrapeAttempt).toHaveBeenCalledWith(
				'scrape-id',
				'api',
				null,
				'FAILED',
				'Sections failed',
				'test-version',
				'user-id',
				expect.anything(),
			);
			expect(response.status).toBe(500);
		});

		it('marks scrape as FAILED when saveRecipeCookingMethods fails', async () => {
			vi.mocked(saveRecipeCookingMethods).mockRejectedValue(
				new RzStepError(500, 'Cooking methods failed', 'Cooking methods failed'),
			);
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith(
				'scrape-id',
				'FAILED',
				'Cooking methods failed',
				'user-id',
				expect.anything(),
			);
			expect(createRecipeScrapeAttempt).toHaveBeenCalledWith(
				'scrape-id',
				'api',
				null,
				'FAILED',
				'Cooking methods failed',
				'test-version',
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
			expect(createRecipeScrapeAttempt).toHaveBeenCalledWith(
				'scrape-id',
				'api',
				null,
				'FAILED',
				'Ingredients failed',
				'test-version',
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

	describe('cover image handling', () => {
		const mockTransformedRecipeWithImage = {
			...mockTransformedRecipe,
			coverImage: { url: 'https://example.com/image.jpg', width: 1500, height: 1125 },
		};

		it('passes coverImageId to saveRecipe when image is fetched successfully', async () => {
			vi.mocked(transformScrapeToRecipe).mockResolvedValue(mockTransformedRecipeWithImage as any);
			vi.mocked(fetchAndStoreCoverImage).mockResolvedValue(mockImage as any);

			await _postHandler({ request: makeRequest(), ctx } as any);

			expect(saveRecipe).toHaveBeenCalledWith(
				expect.objectContaining({ coverImageId: 'image-001' }),
				'user-id',
				expect.anything(),
			);
		});

		it('does not call fetchAndStoreCoverImage and saves with null coverImageId when transformedRecipe has no coverImage', async () => {
			// default mockTransformedRecipe has no coverImage field
			await _postHandler({ request: makeRequest(), ctx } as any);

			expect(fetchAndStoreCoverImage).not.toHaveBeenCalled();
			expect(saveRecipe).toHaveBeenCalledWith(expect.objectContaining({ coverImageId: null }), 'user-id', expect.anything());
		});

		it('creates retry workflow when fetchAndStoreCoverImage throws a retryable error', async () => {
			vi.mocked(transformScrapeToRecipe).mockResolvedValue(mockTransformedRecipeWithImage as any);
			vi.mocked(fetchAndStoreCoverImage).mockRejectedValue(new RzStepError(503, 'Server error', 'Server error', true));

			const response = await _postHandler({ request: makeRequest(), ctx } as any);

			expect(mockEnv.RECIPE_SCRAPE_COVER_IMAGE_RETRY_WORKFLOW.create).toHaveBeenCalledWith({
				id: 'scrape-id',
				params: {
					coverImage: mockTransformedRecipeWithImage.coverImage,
					recipeScrapeId: 'scrape-id',
					userId: 'user-id',
				},
			});
			expect(response.status).toBe(200);
		});

		it('does not create retry workflow for non-retryable errors', async () => {
			vi.mocked(transformScrapeToRecipe).mockResolvedValue(mockTransformedRecipeWithImage as any);
			vi.mocked(fetchAndStoreCoverImage).mockRejectedValue(new RzStepError(403, 'Forbidden', 'Forbidden', false));

			const response = await _postHandler({ request: makeRequest(), ctx } as any);

			expect(mockEnv.RECIPE_SCRAPE_COVER_IMAGE_RETRY_WORKFLOW.create).not.toHaveBeenCalled();
			expect(response.status).toBe(200);
		});

		it('does not create retry workflow when one already exists for the scrape', async () => {
			vi.mocked(transformScrapeToRecipe).mockResolvedValue(mockTransformedRecipeWithImage as any);
			vi.mocked(fetchAndStoreCoverImage).mockRejectedValue(new RzStepError(503, 'Server error', 'Server error', true));
			mockEnv.RECIPE_SCRAPE_COVER_IMAGE_RETRY_WORKFLOW.get.mockResolvedValue({ id: 'scrape-id' });

			const response = await _postHandler({ request: makeRequest(), ctx } as any);

			expect(mockEnv.RECIPE_SCRAPE_COVER_IMAGE_RETRY_WORKFLOW.get).toHaveBeenCalledWith('scrape-id');
			expect(mockEnv.RECIPE_SCRAPE_COVER_IMAGE_RETRY_WORKFLOW.create).not.toHaveBeenCalled();
			expect(response.status).toBe(200);
		});

		it('cover image error does not fail the scrape', async () => {
			vi.mocked(transformScrapeToRecipe).mockResolvedValue(mockTransformedRecipeWithImage as any);
			vi.mocked(fetchAndStoreCoverImage).mockRejectedValue(new RzStepError(503, 'Server error', 'Server error', true));

			const response = await _postHandler({ request: makeRequest(), ctx } as any);

			expect(response.status).toBe(200);
			expect(updateRecipeScrapeStatus).toHaveBeenCalledWith('scrape-id', 'COMPLETED', null, 'user-id', expect.anything());
			expect(updateRecipeScrapeStatus).not.toHaveBeenCalledWith(
				expect.anything(),
				'FAILED',
				expect.anything(),
				expect.anything(),
				expect.anything(),
			);
		});
	});
});

describe('analytics tracking', () => {
	let ctx: { user: { id: string }; logger: RzLogger };

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubEnv('VITE_APP_VERSION', 'test-version');
		ctx = { user: { id: 'user-id' }, logger: createNoopLogger() };

		vi.mocked(parseBodyJson).mockResolvedValue({ url: 'https://allrecipes.com/recipe/123' } as any);
		vi.mocked(initializeScrape).mockResolvedValue(mockScrape as any);
		vi.mocked(transformScrapeToRecipe).mockResolvedValue(mockTransformedRecipe as any);
		vi.mocked(fetchAndStoreCoverImage).mockResolvedValue(mockImage as any);
		vi.mocked(validateAsRecipe).mockResolvedValue(mockValidatedRecipe as any);
		vi.mocked(saveRecipe).mockResolvedValue(mockSavedRecipe as any);
		vi.mocked(saveRecipeSections).mockResolvedValue(mockSavedSections as any);
		vi.mocked(saveRecipeCookingMethods).mockResolvedValue(undefined);
		vi.mocked(saveRecipeIngredients).mockResolvedValue({} as any);
		vi.mocked(createRecipeScrapeAttempt).mockResolvedValue(undefined as any);
		vi.mocked(updateRecipeScrapeStatus).mockResolvedValue(mockScrape as any);
		vi.mocked(linkRecipeScrapeToRecipe).mockResolvedValue(undefined as any);
		mockEnv.RECIPE_SCRAPE_COVER_IMAGE_RETRY_WORKFLOW.get.mockResolvedValue(null);
		mockEnv.RECIPE_SCRAPE_COVER_IMAGE_RETRY_WORKFLOW.create.mockResolvedValue(undefined);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it('tracks a successful scrape with success: true', async () => {
		await _postHandler({ request: makeRequest(), ctx } as any);

		expect(trackScrapeAttempt).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
	});

	it('tracks a failed scrape with success: false', async () => {
		vi.mocked(transformScrapeToRecipe).mockRejectedValue(new RzStepError(422, 'Failed', 'Failed'));

		await _postHandler({ request: makeRequest(), ctx } as any);

		expect(trackScrapeAttempt).toHaveBeenCalledWith(expect.objectContaining({ success: false }));
	});

	it('extracts the domain from the parsed body URL', async () => {
		await _postHandler({ request: makeRequest(), ctx } as any);

		expect(trackScrapeAttempt).toHaveBeenCalledWith(expect.objectContaining({ domain: 'allrecipes.com' }));
	});

	it('falls back to "unknown" when the parsed body has no URL', async () => {
		vi.mocked(parseBodyJson).mockResolvedValue({} as any);
		vi.mocked(transformScrapeToRecipe).mockRejectedValue(new RzStepError(422, 'Failed', 'Failed'));

		await _postHandler({ request: makeRequest(), ctx } as any);

		expect(trackScrapeAttempt).toHaveBeenCalledWith(expect.objectContaining({ domain: 'unknown' }));
	});

	it('includes the userId in the tracked data point', async () => {
		await _postHandler({ request: makeRequest(), ctx } as any);

		expect(trackScrapeAttempt).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-id' }));
	});

	it('includes a non-negative durationMs', async () => {
		await _postHandler({ request: makeRequest(), ctx } as any);

		const call = vi.mocked(trackScrapeAttempt).mock.calls[0][0];
		expect(call.durationMs).toBeGreaterThanOrEqual(0);
	});

	it('tracks exactly once per request on success', async () => {
		await _postHandler({ request: makeRequest(), ctx } as any);

		expect(trackScrapeAttempt).toHaveBeenCalledTimes(1);
	});

	it('tracks exactly once per request on failure', async () => {
		vi.mocked(transformScrapeToRecipe).mockRejectedValue(new RzStepError(422, 'Failed', 'Failed'));

		await _postHandler({ request: makeRequest(), ctx } as any);

		expect(trackScrapeAttempt).toHaveBeenCalledTimes(1);
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
		vi.mocked(fetchAndStoreCoverImage).mockResolvedValue(mockImage as any);
		vi.mocked(validateAsRecipe).mockResolvedValue(mockValidatedRecipe as any);
		vi.mocked(saveRecipe).mockResolvedValue(mockSavedRecipe as any);
		vi.mocked(saveRecipeSections).mockResolvedValue(mockSavedSections as any);
		vi.mocked(saveRecipeCookingMethods).mockResolvedValue(undefined);
		vi.mocked(saveRecipeIngredients).mockResolvedValue({} as any);
		vi.mocked(createRecipeScrapeAttempt).mockResolvedValue(undefined as any);
		vi.mocked(updateRecipeScrapeStatus).mockResolvedValue(mockScrape as any);
		authCheck = handler.post[0] as ReturnType<typeof vi.fn>;
		vi.mocked(authCheck).mockReturnValue(undefined); // passes through by default
		// handler.post[1] is the function returned by requirePermissions() at module init
		permissionCheck = handler.post[1] as ReturnType<typeof vi.fn>;
		vi.mocked(permissionCheck).mockResolvedValue(undefined); // passes through by default
		ctx = { user: { id: 'user-id' }, logger: createNoopLogger() };
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
