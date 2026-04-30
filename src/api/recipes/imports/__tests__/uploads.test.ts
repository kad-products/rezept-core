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

vi.mock('@/repositories/recipe-uploads', () => ({
	createRecipeUpload: vi.fn(),
}));

vi.mock('@/middleware/permissions', () => ({
	requirePermissions: vi.fn(() => vi.fn()),
}));

import { requireAuthentication } from '@/interrupters/require-authentication';
import { createRecipeUpload } from '@/repositories/recipe-uploads';
import handler, { _postHandler } from '../uploads';

const makeFile = (name = 'recipe.csv', type = 'text/csv') => new File(['title,url\ntest,http://example.com'], name, { type });

const makeRequest = (file = makeFile()) => {
	const formData = new FormData();
	formData.append('file', file);
	return new Request('https://example.com/api/recipes/imports/uploads', {
		method: 'POST',
		body: formData,
	});
};

const mockUpload = {
	id: 'upload-id',
	originalFilename: 'recipe.csv',
	r2Key: '/raw/recipe.csv',
	mimeType: 'text/csv',
	fileSize: 36,
	status: 'UPLOADED',
	createdAt: new Date().toISOString(),
	updatedAt: null,
	deletedAt: null,
	createdBy: 'user-id',
	updatedBy: null,
	deletedBy: null,
};

describe('_postHandler', () => {
	let ctx: { user: { id: string } | null; logger: RzLogger };

	beforeEach(() => {
		vi.clearAllMocks();
		mockEnv.REZEPT_ENV = 'development';
		mockEnv.rezept_recipe_uploads.put.mockResolvedValue({ key: '/raw/recipe.csv' });
		vi.mocked(createRecipeUpload).mockResolvedValue(mockUpload as any);
		ctx = { user: { id: 'user-id' }, logger: new Logger() };
	});

	describe('file upload', () => {
		it('uploads the file to R2 at /raw/<filename>', async () => {
			await _postHandler({ request: makeRequest(), ctx } as any);
			expect(mockEnv.rezept_recipe_uploads.put).toHaveBeenCalledWith('/raw/recipe.csv', expect.anything(), {
				httpMetadata: { contentType: 'text/csv' },
			});
		});

		it('creates a recipe upload record with the correct file metadata', async () => {
			await _postHandler({ request: makeRequest(), ctx } as any);
			expect(createRecipeUpload).toHaveBeenCalledWith(
				expect.objectContaining({
					originalFilename: 'recipe.csv',
					r2Key: '/raw/recipe.csv',
					mimeType: 'text/csv',
					status: 'UPLOADED',
				}),
				'user-id',
				expect.anything(),
			);
		});

		it('returns 200 with the created upload record', async () => {
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(response.status).toBe(200);
			const body = (await response.json()) as any;
			expect(body).toMatchObject({ data: { id: 'upload-id', originalFilename: 'recipe.csv' } });
		});

		it('uses the original file name in the R2 key', async () => {
			await _postHandler({ request: makeRequest(makeFile('my-recipe.csv')), ctx } as any);
			expect(mockEnv.rezept_recipe_uploads.put).toHaveBeenCalledWith('/raw/my-recipe.csv', expect.anything(), expect.anything());
			expect(createRecipeUpload).toHaveBeenCalledWith(
				expect.objectContaining({ originalFilename: 'my-recipe.csv', r2Key: '/raw/my-recipe.csv' }),
				expect.anything(),
				expect.anything(),
			);
		});
	});

	describe('error handling', () => {
		it('returns 500 with the error message in development when createRecipeUpload fails', async () => {
			vi.mocked(createRecipeUpload).mockRejectedValue(new Error('DB connection failed'));
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(response.status).toBe(500);
			const body = (await response.json()) as any;
			expect(body.success).toBe(false);
			expect(body.error).toBe('DB connection failed');
		});

		it('hides error details in production when createRecipeUpload fails', async () => {
			mockEnv.REZEPT_ENV = 'production';
			vi.mocked(createRecipeUpload).mockRejectedValue(new Error('DB connection failed'));
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(response.status).toBe(500);
			const body = (await response.json()) as any;
			expect(body.error).toBe('Error uploading recipe');
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
	let permissionCheck: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockEnv.rezept_recipe_uploads.put.mockResolvedValue({ key: '/raw/recipe.csv' });
		vi.mocked(createRecipeUpload).mockResolvedValue(mockUpload as any);
		// handler.post[0] is the function returned by requirePermissions() at module init
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
