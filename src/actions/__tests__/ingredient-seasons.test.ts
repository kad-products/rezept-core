import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNoopLogger } from '@/logger';
import type { RzLogger } from '@/types';

const mockEnv = vi.hoisted(() => ({ REZEPT_ENV: 'development' as string }));
const capturedChain = vi.hoisted(() => ({ handlers: [] as unknown[] }));

vi.mock('@/repositories', () => ({
	createIngredientSeason: vi.fn(),
	updateIngredientSeason: vi.fn(),
}));

vi.mock('cloudflare:workers', () => ({
	env: mockEnv,
}));

interface MockRequestInfo {
	ctx: {
		user: { id: string } | null;
		logger: RzLogger;
	};
}

const mockRequestInfo: MockRequestInfo = {
	ctx: {
		user: { id: 'test-user-id' },
		logger: createNoopLogger(),
	},
};

vi.mock('rwsdk/worker', () => ({
	serverAction: (handlers: unknown[]) => {
		capturedChain.handlers = handlers;
		return Array.isArray(handlers) ? handlers[handlers.length - 1] : handlers;
	},
	get requestInfo() {
		return mockRequestInfo;
	},
}));

import { randomUUID } from 'node:crypto';
import { requireAuthentication } from '@/interrupters';
import { createIngredientSeason, updateIngredientSeason } from '@/repositories';
import { _saveIngredientSeason } from '../ingredient-seasons';

const VALID_INGREDIENT_ID = randomUUID();

const VALID_FORM_DATA = {
	ingredientId: VALID_INGREDIENT_ID,
	country: 'USA',
	startMonth: 6,
	endMonth: 8,
} as const;

describe('saveIngredientSeason', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx.user = { id: 'test-user-id' };
		mockEnv.REZEPT_ENV = 'development';

		vi.mocked(createIngredientSeason).mockResolvedValue({ id: 'mock-season-id' } as never);
		vi.mocked(updateIngredientSeason).mockResolvedValue({ id: 'mock-season-id' } as never);
	});

	describe('middleware chain', () => {
		it('includes requireAuthentication in the serverAction chain', () => {
			expect(capturedChain.handlers).toContain(requireAuthentication);
		});
	});

	describe('create', () => {
		it('creates a season with valid data', async () => {
			const result = await _saveIngredientSeason(VALID_FORM_DATA);

			expect(result.success).toBe(true);
			expect(createIngredientSeason).toHaveBeenCalledTimes(1);
			expect(createIngredientSeason).toHaveBeenCalledWith(
				expect.objectContaining({
					ingredientId: VALID_INGREDIENT_ID,
					country: 'USA',
					startMonth: 6,
					endMonth: 8,
				}),
				'test-user-id',
				expect.anything(),
			);
		});

		it('coerces string month values to numbers before saving', async () => {
			const result = await _saveIngredientSeason({
				...VALID_FORM_DATA,
				startMonth: '6' as unknown as number,
				endMonth: '8' as unknown as number,
			});

			expect(result.success).toBe(true);
			expect(createIngredientSeason).toHaveBeenCalledWith(
				expect.objectContaining({ startMonth: 6, endMonth: 8 }),
				'test-user-id',
				expect.anything(),
			);
		});

		it('passes region through to the repository', async () => {
			await _saveIngredientSeason({ ...VALID_FORM_DATA, region: 'California' });

			expect(createIngredientSeason).toHaveBeenCalledWith(
				expect.objectContaining({ region: 'California' }),
				'test-user-id',
				expect.anything(),
			);
		});

		it('passes notes through to the repository', async () => {
			await _saveIngredientSeason({ ...VALID_FORM_DATA, notes: 'Peak ripeness in July' });

			expect(createIngredientSeason).toHaveBeenCalledWith(
				expect.objectContaining({ notes: 'Peak ripeness in July' }),
				'test-user-id',
				expect.anything(),
			);
		});

		it('does not call updateIngredientSeason on create', async () => {
			await _saveIngredientSeason(VALID_FORM_DATA);
			expect(updateIngredientSeason).not.toHaveBeenCalled();
		});
	});

	describe('update', () => {
		it('calls updateIngredientSeason when id is provided', async () => {
			const seasonId = randomUUID();
			const result = await _saveIngredientSeason({ ...VALID_FORM_DATA, id: seasonId });

			expect(result.success).toBe(true);
			expect(updateIngredientSeason).toHaveBeenCalledTimes(1);
			expect(updateIngredientSeason).toHaveBeenCalledWith(
				seasonId,
				expect.objectContaining({ country: 'USA', startMonth: 6, endMonth: 8 }),
				'test-user-id',
				expect.anything(),
			);
		});

		it('does not call createIngredientSeason on update', async () => {
			await _saveIngredientSeason({ ...VALID_FORM_DATA, id: randomUUID() });
			expect(createIngredientSeason).not.toHaveBeenCalled();
		});
	});

	describe('validation', () => {
		it('returns error when ingredientId is missing', async () => {
			const { ingredientId: _omit, ...data } = VALID_FORM_DATA;
			const result = await _saveIngredientSeason(data as never);

			expect(result.success).toBe(false);
			expect(result.errors?.ingredientId).toBeDefined();
			expect(createIngredientSeason).not.toHaveBeenCalled();
		});

		it('returns error when ingredientId is not a valid UUID', async () => {
			const result = await _saveIngredientSeason({ ...VALID_FORM_DATA, ingredientId: 'not-a-uuid' });

			expect(result.success).toBe(false);
			expect(result.errors?.ingredientId).toBeDefined();
			expect(createIngredientSeason).not.toHaveBeenCalled();
		});

		it('returns error when country is missing', async () => {
			const { country: _omit, ...data } = VALID_FORM_DATA;
			const result = await _saveIngredientSeason(data as never);

			expect(result.success).toBe(false);
			expect(result.errors?.country).toBeDefined();
		});

		it('returns error when country is the wrong length', async () => {
			const result = await _saveIngredientSeason({ ...VALID_FORM_DATA, country: 'US' });

			expect(result.success).toBe(false);
			expect(result.errors?.country).toBeDefined();
		});

		it('returns error when country is not a recognised code', async () => {
			const result = await _saveIngredientSeason({ ...VALID_FORM_DATA, country: 'XYZ' });

			expect(result.success).toBe(false);
			expect(result.errors?.country).toBeDefined();
		});

		it('returns error when startMonth is below 1', async () => {
			const result = await _saveIngredientSeason({ ...VALID_FORM_DATA, startMonth: 0 });

			expect(result.success).toBe(false);
			expect(result.errors?.startMonth).toBeDefined();
		});

		it('returns error when startMonth is above 12', async () => {
			const result = await _saveIngredientSeason({ ...VALID_FORM_DATA, startMonth: 13 });

			expect(result.success).toBe(false);
			expect(result.errors?.startMonth).toBeDefined();
		});

		it('returns error when endMonth is below 1', async () => {
			const result = await _saveIngredientSeason({ ...VALID_FORM_DATA, endMonth: 0 });

			expect(result.success).toBe(false);
			expect(result.errors?.endMonth).toBeDefined();
		});

		it('returns error when endMonth is above 12', async () => {
			const result = await _saveIngredientSeason({ ...VALID_FORM_DATA, endMonth: 13 });

			expect(result.success).toBe(false);
			expect(result.errors?.endMonth).toBeDefined();
		});

		it('returns error when startMonth is missing', async () => {
			const { startMonth: _omit, ...data } = VALID_FORM_DATA;
			const result = await _saveIngredientSeason(data as never);

			expect(result.success).toBe(false);
			expect(result.errors?.startMonth).toBeDefined();
		});

		it('returns error when endMonth is missing', async () => {
			const { endMonth: _omit, ...data } = VALID_FORM_DATA;
			const result = await _saveIngredientSeason(data as never);

			expect(result.success).toBe(false);
			expect(result.errors?.endMonth).toBeDefined();
		});

		it('accepts boundary months 1 and 12', async () => {
			const result = await _saveIngredientSeason({ ...VALID_FORM_DATA, startMonth: 1, endMonth: 12 });
			expect(result.success).toBe(true);
		});

		it('accepts wrap-around range where startMonth is greater than endMonth', async () => {
			// e.g. Nov–Feb spans year boundary — schema allows it, query logic handles the wrap
			const result = await _saveIngredientSeason({ ...VALID_FORM_DATA, startMonth: 11, endMonth: 2 });
			expect(result.success).toBe(true);
		});

		it('returns error when provided id is not a valid UUID', async () => {
			const result = await _saveIngredientSeason({ ...VALID_FORM_DATA, id: 'not-a-uuid' });

			expect(result.success).toBe(false);
			expect(result.errors?.id).toBeDefined();
		});
	});

	describe('error handling', () => {
		it('returns error response when createIngredientSeason throws', async () => {
			vi.mocked(createIngredientSeason).mockRejectedValueOnce(new Error('DB error'));

			const result = await _saveIngredientSeason(VALID_FORM_DATA);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('returns error response when updateIngredientSeason throws', async () => {
			vi.mocked(updateIngredientSeason).mockRejectedValueOnce(new Error('DB error'));

			const result = await _saveIngredientSeason({ ...VALID_FORM_DATA, id: randomUUID() });

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('surfaces the raw error message in dev mode', async () => {
			vi.mocked(createIngredientSeason).mockRejectedValueOnce(new Error('DB error'));
			mockEnv.REZEPT_ENV = 'development';

			const result = await _saveIngredientSeason(VALID_FORM_DATA);

			expect(result.errors?._form?.[0]).toBe('DB error');
		});

		it('returns only the static message in production (no internal detail)', async () => {
			vi.mocked(createIngredientSeason).mockRejectedValueOnce(
				new Error('Connection failed: postgres://user:password@db.internal'),
			);
			mockEnv.REZEPT_ENV = 'production';

			const result = await _saveIngredientSeason(VALID_FORM_DATA);

			expect(result.errors?._form?.[0]).toBe('Failed to save ingredient season');
			expect(result.errors?._form?.[0]).not.toContain('password');
		});
	});
});
