import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNoopLogger } from '@/logger';
import type { IngredientDBRead, RzLogger } from '@/types';

const mockEnv = vi.hoisted(() => ({
	REZEPT_ADMIN_OPERATIONS: {
		put: vi.fn(),
	},
}));

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

vi.mock('@/steps', () => ({
	readCsvFromR2Object: vi.fn(),
	saveIngredientLoad: vi.fn(),
}));

vi.mock('@/interrupters', () => ({
	requireAuthentication: vi.fn(),
	requirePermissions: vi.fn(() => vi.fn()),
}));

import { requireAuthentication } from '@/interrupters';
import { readCsvFromR2Object, saveIngredientLoad } from '@/steps';
import handler, { _postHandler } from '../upload';

const userId = '00000000-0000-0000-0000-000000000001';

const mockRecord = { name: 'bacon', hasSeasons: false };
const mockSavedIngredient = {
	id: '00000000-0000-0000-0000-000000000002',
	name: 'bacon',
} as unknown as IngredientDBRead;

function makeCsvFile(content = 'name,has_seasons\nbacon,false'): File {
	return new File([content], 'ingredients.csv', { type: 'text/csv' });
}

function makeOversizedFileRequest(): Request {
	// File.size reads from a V8 internal slot, so subclasses can't override it.
	// Use a Proxy that intercepts the size property while keeping instanceof File intact.
	const realFile = new File(['x'], 'large.csv', { type: 'text/csv' });
	const oversizedFile = new Proxy(realFile, {
		get(target, key) {
			if (key === 'size') return 101 * 1024 * 1024;
			const val = Reflect.get(target, key, target);
			return typeof val === 'function' ? val.bind(target) : val;
		},
	});
	const fakeFormData = { get: vi.fn().mockReturnValue(oversizedFile) };
	return { formData: vi.fn().mockResolvedValue(fakeFormData) } as unknown as Request;
}

function makeFormDataRequest(file: File | null): Request {
	const formData = new FormData();
	if (file) {
		formData.append('file', file);
	} else {
		formData.append('file', 'not-a-file');
	}
	return new Request('https://example.com/api/ingredients/upload', {
		method: 'POST',
		body: formData,
	});
}

describe('_postHandler', () => {
	let ctx: { user: { id: string }; logger: RzLogger };

	beforeEach(() => {
		vi.clearAllMocks();
		ctx = { user: { id: userId }, logger: createNoopLogger() };
		mockEnv.REZEPT_ADMIN_OPERATIONS.put.mockResolvedValue(undefined);
		vi.mocked(readCsvFromR2Object).mockResolvedValue([mockRecord]);
		vi.mocked(saveIngredientLoad).mockResolvedValue([mockSavedIngredient]);
	});

	describe('input validation', () => {
		it('returns 400 when no file is provided', async () => {
			const formData = new FormData();
			const request = new Request('https://example.com/api/ingredients/upload', {
				method: 'POST',
				body: formData,
			});

			const response = await _postHandler({ request, ctx } as any);

			expect(response.status).toBe(400);
		});

		it('returns 400 when the field value is not a File', async () => {
			const request = makeFormDataRequest(null);

			const response = await _postHandler({ request, ctx } as any);

			expect(response.status).toBe(400);
		});

		it('returns 413 when the file exceeds 100MB', async () => {
			const response = await _postHandler({ request: makeOversizedFileRequest(), ctx } as any);

			expect(response.status).toBe(413);
		});
	});

	describe('happy path', () => {
		it('returns 200 with recordCount and ingredients', async () => {
			const request = makeFormDataRequest(makeCsvFile());

			const response = await _postHandler({ request, ctx } as any);

			expect(response.status).toBe(200);
			const body = (await response.json()) as any;
			expect(body.data.recordCount).toBe(1);
			expect(body.data.ingredients).toHaveLength(1);
		});

		it('streams the file to R2 before parsing', async () => {
			const request = makeFormDataRequest(makeCsvFile());

			await _postHandler({ request, ctx } as any);

			expect(mockEnv.REZEPT_ADMIN_OPERATIONS.put).toHaveBeenCalledOnce();
		});

		it('calls readCsvFromR2Object with the R2 key and bucket', async () => {
			const request = makeFormDataRequest(makeCsvFile());

			await _postHandler({ request, ctx } as any);

			expect(readCsvFromR2Object).toHaveBeenCalledWith(
				mockEnv.REZEPT_ADMIN_OPERATIONS,
				expect.stringMatching(/^ingredients\//),
				ctx.logger,
				expect.anything(),
			);
		});

		it('calls saveIngredientLoad with the parsed data', async () => {
			const request = makeFormDataRequest(makeCsvFile());

			await _postHandler({ request, ctx } as any);

			expect(saveIngredientLoad).toHaveBeenCalledWith([mockRecord], userId, ctx.logger);
		});

		it('includes the R2 key in the response', async () => {
			const request = makeFormDataRequest(makeCsvFile());

			const response = await _postHandler({ request, ctx } as any);

			const body = (await response.json()) as any;
			expect(body.data.key).toMatch(/^ingredients\//);
		});
	});

	describe('route handler', () => {
		it('handler chain ends with _postHandler', () => {
			expect(handler.post[handler.post.length - 1]).toBe(_postHandler);
		});

		it('includes requireAuthentication in the chain', () => {
			expect(handler.post).toContain(requireAuthentication);
		});

		it('handler chain has 3 handlers (auth, permission, handler)', () => {
			expect(handler.post).toHaveLength(3);
		});
	});
});
