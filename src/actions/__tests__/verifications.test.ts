import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNoopLogger } from '@/logger';
import type { RzLogger } from '@/types';

const mockEnv = vi.hoisted(() => ({ REZEPT_ENV: 'development' as string }));
const capturedChain = vi.hoisted(() => ({ handlers: [] as unknown[] }));

vi.mock('@/repositories', () => ({
	verifyIngredient: vi.fn(),
	verifyIngredientSeason: vi.fn(),
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
import { verifyIngredient, verifyIngredientSeason } from '@/repositories';
import { _saveVerification } from '../verifications';

const VALID_INGREDIENT_ID = randomUUID();
const VALID_SEASON_ID = randomUUID();

const MOCK_VERIFICATION = {
	id: randomUUID(),
	ingredientId: VALID_INGREDIENT_ID,
	ingredientSeasonId: null,
	createdAt: new Date().toISOString(),
	createdBy: 'test-user-id',
	updatedAt: null,
	updatedBy: null,
	deletedAt: null,
	deletedBy: null,
};

const MOCK_INGREDIENT = {
	id: VALID_INGREDIENT_ID,
	name: 'Tomato',
	lastVerifiedAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	updatedBy: 'test-user-id',
};

const MOCK_SEASON = {
	id: VALID_SEASON_ID,
	ingredientId: VALID_INGREDIENT_ID,
	lastVerifiedAt: new Date().toISOString(),
	updatedAt: new Date().toISOString(),
	updatedBy: 'test-user-id',
};

describe('saveVerification', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx.user = { id: 'test-user-id' };
		mockEnv.REZEPT_ENV = 'development';

		vi.mocked(verifyIngredient).mockResolvedValue({
			verification: MOCK_VERIFICATION,
			ingredient: MOCK_INGREDIENT,
		} as never);

		vi.mocked(verifyIngredientSeason).mockResolvedValue({
			verification: { ...MOCK_VERIFICATION, ingredientId: null, ingredientSeasonId: VALID_SEASON_ID },
			season: MOCK_SEASON,
		} as never);
	});

	describe('middleware chain', () => {
		it('includes requireAuthentication in the serverAction chain', () => {
			expect(capturedChain.handlers).toContain(requireAuthentication);
		});

		it('includes a requirePermissions handler in the chain', () => {
			const nonTerminal = capturedChain.handlers.slice(0, -1);
			expect(nonTerminal.length).toBeGreaterThanOrEqual(2);
			expect(nonTerminal.some(h => typeof h === 'function')).toBe(true);
		});
	});

	describe('ingredient verification', () => {
		it('creates an ingredient verification when ingredientId is provided', async () => {
			const result = await _saveVerification({ ingredientId: VALID_INGREDIENT_ID });

			expect(result.success).toBe(true);
			expect(verifyIngredient).toHaveBeenCalledTimes(1);
			expect(verifyIngredient).toHaveBeenCalledWith(VALID_INGREDIENT_ID, 'test-user-id', expect.anything());
		});

		it('returns the verification record on success', async () => {
			const result = await _saveVerification({ ingredientId: VALID_INGREDIENT_ID });

			expect(result.success).toBe(true);
			expect(result.data).toEqual(MOCK_VERIFICATION);
		});

		it('does not call verifyIngredientSeason when ingredientId is provided', async () => {
			await _saveVerification({ ingredientId: VALID_INGREDIENT_ID });
			expect(verifyIngredientSeason).not.toHaveBeenCalled();
		});
	});

	describe('ingredient season verification', () => {
		it('creates a season verification when ingredientSeasonId is provided', async () => {
			const result = await _saveVerification({ ingredientSeasonId: VALID_SEASON_ID });

			expect(result.success).toBe(true);
			expect(verifyIngredientSeason).toHaveBeenCalledTimes(1);
			expect(verifyIngredientSeason).toHaveBeenCalledWith(VALID_SEASON_ID, 'test-user-id', expect.anything());
		});

		it('returns the verification record on success', async () => {
			const result = await _saveVerification({ ingredientSeasonId: VALID_SEASON_ID });

			expect(result.success).toBe(true);
			expect(result.data).toEqual({ ...MOCK_VERIFICATION, ingredientId: null, ingredientSeasonId: VALID_SEASON_ID });
		});

		it('does not call verifyIngredient when ingredientSeasonId is provided', async () => {
			await _saveVerification({ ingredientSeasonId: VALID_SEASON_ID });
			expect(verifyIngredient).not.toHaveBeenCalled();
		});
	});

	describe('validation', () => {
		it('returns error when id is provided (update not implemented)', async () => {
			const result = await _saveVerification({ id: randomUUID(), ingredientId: VALID_INGREDIENT_ID });

			expect(result.success).toBe(false);
			expect(verifyIngredient).not.toHaveBeenCalled();
			expect(verifyIngredientSeason).not.toHaveBeenCalled();
		});

		it('returns 400 code when id is provided', async () => {
			const result = await _saveVerification({ id: randomUUID(), ingredientId: VALID_INGREDIENT_ID });

			expect(result.code).toBe(400);
		});

		it('returns error when neither ingredientId nor ingredientSeasonId is provided', async () => {
			const result = await _saveVerification({});

			expect(result.success).toBe(false);
			expect(verifyIngredient).not.toHaveBeenCalled();
			expect(verifyIngredientSeason).not.toHaveBeenCalled();
		});

		it('returns 400 code when neither id field is provided', async () => {
			const result = await _saveVerification({});

			expect(result.code).toBe(400);
		});

		it('returns error when ingredientId is not a valid UUID', async () => {
			const result = await _saveVerification({ ingredientId: 'not-a-uuid' });

			expect(result.success).toBe(false);
			expect(result.errors?.ingredientId).toBeDefined();
			expect(verifyIngredient).not.toHaveBeenCalled();
		});

		it('returns error when ingredientSeasonId is not a valid UUID', async () => {
			const result = await _saveVerification({ ingredientSeasonId: 'not-a-uuid' });

			expect(result.success).toBe(false);
			expect(result.errors?.ingredientSeasonId).toBeDefined();
			expect(verifyIngredientSeason).not.toHaveBeenCalled();
		});

		it('returns error when provided id is not a valid UUID', async () => {
			const result = await _saveVerification({ id: 'not-a-uuid', ingredientId: VALID_INGREDIENT_ID });

			expect(result.success).toBe(false);
			expect(result.errors?.id).toBeDefined();
		});

		it('accepts null ingredientId (treated as absent)', async () => {
			// optionalUuid accepts null — schema coerces to undefined, so it's treated as not provided
			await _saveVerification({ ingredientId: null });

			// Neither verifier should be called since both IDs are absent/null
			expect(verifyIngredient).not.toHaveBeenCalled();
			expect(verifyIngredientSeason).not.toHaveBeenCalled();
		});

		it('prefers ingredientId over ingredientSeasonId when both are provided', async () => {
			const result = await _saveVerification({
				ingredientId: VALID_INGREDIENT_ID,
				ingredientSeasonId: VALID_SEASON_ID,
			});

			expect(result.success).toBe(true);
			expect(verifyIngredient).toHaveBeenCalledTimes(1);
			expect(verifyIngredientSeason).not.toHaveBeenCalled();
		});
	});

	describe('error handling', () => {
		it('returns error response when verifyIngredient throws', async () => {
			vi.mocked(verifyIngredient).mockRejectedValueOnce(new Error('DB error'));

			const result = await _saveVerification({ ingredientId: VALID_INGREDIENT_ID });

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('returns error response when verifyIngredientSeason throws', async () => {
			vi.mocked(verifyIngredientSeason).mockRejectedValueOnce(new Error('DB error'));

			const result = await _saveVerification({ ingredientSeasonId: VALID_SEASON_ID });

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('returns 500 code when repository throws', async () => {
			vi.mocked(verifyIngredient).mockRejectedValueOnce(new Error('DB error'));

			const result = await _saveVerification({ ingredientId: VALID_INGREDIENT_ID });

			expect(result.code).toBe(500);
		});

		it('surfaces the raw error message in dev mode', async () => {
			vi.mocked(verifyIngredient).mockRejectedValueOnce(new Error('DB error'));
			mockEnv.REZEPT_ENV = 'development';

			const result = await _saveVerification({ ingredientId: VALID_INGREDIENT_ID });

			expect(result.errors?._form?.[0]).toBe('DB error');
		});

		it('returns only the static message in production (no internal detail)', async () => {
			vi.mocked(verifyIngredient).mockRejectedValueOnce(new Error('Connection failed: postgres://user:password@db.internal'));
			mockEnv.REZEPT_ENV = 'production';

			const result = await _saveVerification({ ingredientId: VALID_INGREDIENT_ID });

			expect(result.errors?._form?.[0]).toBe('Failed to save verification');
			expect(result.errors?._form?.[0]).not.toContain('password');
		});
	});
});
