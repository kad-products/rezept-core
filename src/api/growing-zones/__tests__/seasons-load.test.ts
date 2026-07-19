import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNoopLogger } from '@/logger';
import type { IngredientSeasonDBRead, RzLogger } from '@/types';

const mockEnv = vi.hoisted(() => ({
	REZEPT_ADMIN_OPERATIONS: {
		put: vi.fn(),
	},
}));

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

vi.mock('@/steps', () => ({
	readCsvFromR2Object: vi.fn(),
	saveGrowingZonesSeasonsLoad: vi.fn(),
}));

vi.mock('@/repositories', () => ({
	getGrowingZoneById: vi.fn(),
}));

vi.mock('@/interrupters', () => ({
	requireAuthentication: vi.fn(),
	requirePermissions: vi.fn(() => vi.fn()),
}));

import { requireAuthentication } from '@/interrupters';
import { getGrowingZoneById } from '@/repositories';
import { readCsvFromR2Object, saveGrowingZonesSeasonsLoad } from '@/steps';
import handler, { _postHandler } from '../seasons-load';

const userId = '00000000-0000-0000-0000-000000000001';
const growingZoneId = '00000000-0000-0000-0000-000000000010';

const mockRecord = { ingredientName: 'tomato', startMonth: 6, endMonth: 9 };
const mockSavedSeason = { id: '00000000-0000-0000-0000-000000000002' } as unknown as IngredientSeasonDBRead;

function makeCsvFile(content = 'ingredient_name,start_month,end_month\ntomato,6,9'): File {
	return new File([content], 'seasons.csv', { type: 'text/csv' });
}

function makeOversizedFileRequest(params = { growingZoneId }): Request {
	const realFile = new File(['x'], 'large.csv', { type: 'text/csv' });
	const oversizedFile = new Proxy(realFile, {
		get(target, key) {
			if (key === 'size') return 101 * 1024 * 1024;
			const val = Reflect.get(target, key, target);
			return typeof val === 'function' ? val.bind(target) : val;
		},
	});
	const fakeFormData = { get: vi.fn().mockReturnValue(oversizedFile) };
	return { formData: vi.fn().mockResolvedValue(fakeFormData), params } as unknown as Request;
}

function makeFormDataRequest(file: File | null, params = { growingZoneId }): Request {
	const formData = new FormData();
	if (file) {
		formData.append('file', file);
	} else {
		formData.append('file', 'not-a-file');
	}
	return new Request('https://example.com/api/growing-zones/seasons-load', {
		method: 'POST',
		body: formData,
	}) as unknown as Request & { params: typeof params };
}

describe('_postHandler', () => {
	let ctx: { user: { id: string }; logger: RzLogger };

	beforeEach(() => {
		vi.clearAllMocks();
		ctx = { user: { id: userId }, logger: createNoopLogger() };
		mockEnv.REZEPT_ADMIN_OPERATIONS.put.mockResolvedValue(undefined);
		vi.mocked(getGrowingZoneById).mockResolvedValue(undefined as any);
		vi.mocked(readCsvFromR2Object).mockResolvedValue([mockRecord]);
		vi.mocked(saveGrowingZonesSeasonsLoad).mockResolvedValue([mockSavedSeason]);
	});

	describe('input validation', () => {
		it('returns 400 when growingZoneId is missing from params', async () => {
			const request = makeFormDataRequest(makeCsvFile());

			const response = await _postHandler({ request, ctx, params: {} } as any);

			expect(response.status).toBe(400);
		});

		it('returns error response when getGrowingZoneById throws', async () => {
			vi.mocked(getGrowingZoneById).mockRejectedValueOnce(new Error('not found'));
			const request = makeFormDataRequest(makeCsvFile());

			const response = await _postHandler({ request, ctx, params: { growingZoneId } } as any);

			expect(response.status).toBe(500);
		});

		it('returns 400 when the file field is not a File', async () => {
			const request = makeFormDataRequest(null);

			const response = await _postHandler({ request, ctx, params: { growingZoneId } } as any);

			expect(response.status).toBe(400);
		});

		it('returns 413 when the file exceeds 100MB', async () => {
			const response = await _postHandler({ request: makeOversizedFileRequest(), ctx, params: { growingZoneId } } as any);

			expect(response.status).toBe(413);
		});
	});

	describe('happy path', () => {
		it('returns 200 with recordCount and ingredients', async () => {
			const request = makeFormDataRequest(makeCsvFile());

			const response = await _postHandler({ request, ctx, params: { growingZoneId } } as any);

			expect(response.status).toBe(200);
			const body = (await response.json()) as any;
			expect(body.data.recordCount).toBe(1);
			expect(body.data.ingredients).toHaveLength(1);
		});

		it('streams the file to R2 before parsing', async () => {
			const request = makeFormDataRequest(makeCsvFile());

			await _postHandler({ request, ctx, params: { growingZoneId } } as any);

			expect(mockEnv.REZEPT_ADMIN_OPERATIONS.put).toHaveBeenCalledOnce();
		});

		it('calls readCsvFromR2Object with the R2 key, bucket, and schema', async () => {
			const request = makeFormDataRequest(makeCsvFile());

			await _postHandler({ request, ctx, params: { growingZoneId } } as any);

			expect(readCsvFromR2Object).toHaveBeenCalledWith(
				mockEnv.REZEPT_ADMIN_OPERATIONS,
				expect.stringMatching(/^growing-zones\/seasons-load\//),
				ctx.logger,
				expect.anything(),
			);
		});

		it('calls saveGrowingZonesSeasonsLoad with parsed data, growingZoneId, and userId', async () => {
			const request = makeFormDataRequest(makeCsvFile());

			await _postHandler({ request, ctx, params: { growingZoneId } } as any);

			expect(saveGrowingZonesSeasonsLoad).toHaveBeenCalledWith([mockRecord], growingZoneId, userId, ctx.logger);
		});

		it('includes the R2 key in the response', async () => {
			const request = makeFormDataRequest(makeCsvFile());

			const response = await _postHandler({ request, ctx, params: { growingZoneId } } as any);

			const body = (await response.json()) as any;
			expect(body.data.key).toMatch(/^growing-zones\/seasons-load\//);
		});

		it('validates the growing zone exists before processing the file', async () => {
			const request = makeFormDataRequest(makeCsvFile());

			await _postHandler({ request, ctx, params: { growingZoneId } } as any);

			expect(getGrowingZoneById).toHaveBeenCalledWith(growingZoneId, ctx.logger);
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
