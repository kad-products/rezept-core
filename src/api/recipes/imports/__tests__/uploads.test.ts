import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNoopLogger } from '@/logger';
import type { RzLogger } from '@/types';

const mockEnv = vi.hoisted(() => ({
	REZEPT_ENV: 'development' as string,
	REZEPT_RECIPE_UPLOADS: {
		put: vi.fn(),
	},
}));

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

vi.mock('@/repositories', () => ({
	createRecipeUpload: vi.fn(),
}));

vi.mock('@/interrupters', () => ({
	requireAuthentication: vi.fn(),
	requirePermissions: vi.fn(() => vi.fn()),
}));

import { requireAuthentication } from '@/interrupters';
import { createRecipeUpload } from '@/repositories';
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
		mockEnv.REZEPT_RECIPE_UPLOADS.put.mockResolvedValue({});
		vi.mocked(createRecipeUpload).mockResolvedValue(mockUpload as any);
		ctx = { user: { id: 'user-id' }, logger: createNoopLogger() };
	});

	const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

	describe('file upload', () => {
		it('uploads the file to R2 using a UUID as the key', async () => {
			await _postHandler({ request: makeRequest(), ctx } as any);
			expect(mockEnv.REZEPT_RECIPE_UPLOADS.put).toHaveBeenCalledWith(expect.stringMatching(uuidPattern), expect.anything(), {
				httpMetadata: { contentType: 'text/csv' },
			});
		});

		it('creates a recipe upload record with the correct file metadata', async () => {
			await _postHandler({ request: makeRequest(), ctx } as any);
			expect(createRecipeUpload).toHaveBeenCalledWith(
				expect.objectContaining({
					id: expect.stringMatching(uuidPattern),
					originalFilename: 'recipe.csv',
					mimeType: 'text/csv',
					status: 'UPLOADED',
				}),
				'user-id',
				'user-id',
				expect.anything(),
			);
		});

		it('uses the same UUID for the R2 key and the upload record id', async () => {
			await _postHandler({ request: makeRequest(), ctx } as any);
			const r2Key = mockEnv.REZEPT_RECIPE_UPLOADS.put.mock.calls[0][0];
			const uploadId = vi.mocked(createRecipeUpload).mock.calls[0][0].id;
			expect(r2Key).toBe(uploadId);
		});

		it('returns 200 with the created upload record', async () => {
			const response = await _postHandler({ request: makeRequest(), ctx } as any);
			expect(response.status).toBe(200);
			const body = (await response.json()) as any;
			expect(body).toMatchObject({ data: { id: 'upload-id', originalFilename: 'recipe.csv' } });
		});

		it('stores the original filename correctly regardless of file name', async () => {
			await _postHandler({ request: makeRequest(makeFile('my-recipe.csv')), ctx } as any);
			expect(createRecipeUpload).toHaveBeenCalledWith(
				expect.objectContaining({ originalFilename: 'my-recipe.csv' }),
				expect.anything(),
				expect.anything(),
				expect.anything(),
			);
		});
	});

	describe('validation', () => {
		it('returns 400 when no file field is present', async () => {
			const formData = new FormData();
			const request = new Request('https://example.com/api/recipes/imports/uploads', {
				method: 'POST',
				body: formData,
			});
			const response = await _postHandler({ request, ctx } as any);
			expect(response.status).toBe(400);
			const body = (await response.json()) as any;
			expect(body.error).toBe('A file is required');
			expect(mockEnv.REZEPT_RECIPE_UPLOADS.put).not.toHaveBeenCalled();
		});

		it('returns 400 when the file field is a string rather than a file', async () => {
			const formData = new FormData();
			formData.append('file', 'not-a-file');
			const request = new Request('https://example.com/api/recipes/imports/uploads', {
				method: 'POST',
				body: formData,
			});
			const response = await _postHandler({ request, ctx } as any);
			expect(response.status).toBe(400);
			const body = (await response.json()) as any;
			expect(body.error).toBe('A file is required');
			expect(mockEnv.REZEPT_RECIPE_UPLOADS.put).not.toHaveBeenCalled();
		});

		it('returns 413 when the file exceeds 100MB', async () => {
			class OversizedFile extends File {
				get size() {
					return 100 * 1024 * 1024 + 1;
				}
			}
			const oversizedFile = new OversizedFile(['x'], 'big.csv', { type: 'text/csv' });
			const mockFormData = new FormData();
			mockFormData.append('file', oversizedFile);
			const request = { formData: vi.fn().mockResolvedValue(mockFormData) };
			const response = await _postHandler({ request, ctx } as any);
			expect(response.status).toBe(413);
			const body = (await response.json()) as any;
			expect(body.error).toBe('File exceeds the 100MB size limit');
			expect(mockEnv.REZEPT_RECIPE_UPLOADS.put).not.toHaveBeenCalled();
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
	let authCheck: ReturnType<typeof vi.fn>;
	let permissionCheck: ReturnType<typeof vi.fn>;

	beforeEach(() => {
		vi.clearAllMocks();
		mockEnv.REZEPT_RECIPE_UPLOADS.put.mockResolvedValue({});
		vi.mocked(createRecipeUpload).mockResolvedValue(mockUpload as any);
		authCheck = handler.post[0] as ReturnType<typeof vi.fn>;
		vi.mocked(authCheck).mockReturnValue(undefined); // passes through by default
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
