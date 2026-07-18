import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNoopLogger } from '@/logger';
import type { RecipeDBRead, RzLogger } from '@/types';

const mockEnv = vi.hoisted(() => ({ REZEPT_ENV: 'development' as string }));
const capturedChain = vi.hoisted(() => ({ handlers: [] as unknown[] }));

vi.mock('@/repositories', () => ({
	searchRecipes: vi.fn(),
}));

vi.mock('cloudflare:workers', () => ({
	env: mockEnv,
}));

vi.mock('@/interrupters', () => ({
	requirePermissions: vi.fn(() => vi.fn()),
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

import { searchRecipes } from '@/repositories';
import { _submitRecipeSearch } from '../submit-recipe-search';

const growingZoneId = '00000000-0000-0000-0000-000000000010';
const searchMonth = '7';

const mockRecipes = [
	{ id: '00000000-0000-0000-0000-000000000001', title: 'Tomato Salad' } as unknown as RecipeDBRead,
	{ id: '00000000-0000-0000-0000-000000000002', title: 'Tomato Soup' } as unknown as RecipeDBRead,
];

describe('_submitRecipeSearch', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockEnv.REZEPT_ENV = 'development';
		vi.mocked(searchRecipes).mockResolvedValue(mockRecipes);
	});

	describe('serverAction chain', () => {
		it('has 2 handlers (permission check + action)', () => {
			expect(capturedChain.handlers).toHaveLength(2);
		});
	});

	describe('successful search', () => {
		it('returns success with matched recipes', async () => {
			const result = await _submitRecipeSearch({ growingZoneId, searchMonth });

			expect(result.success).toBe(true);
			expect(result.data).toEqual(mockRecipes);
		});

		it('calls searchRecipes with growingZoneId and term', async () => {
			await _submitRecipeSearch({ growingZoneId, searchMonth, recipeSearchTerm: 'tomato' });

			expect(searchRecipes).toHaveBeenCalledWith({ growingZoneId, term: 'tomato', month: 7 }, expect.anything());
		});

		it('passes undefined term when recipeSearchTerm is omitted', async () => {
			await _submitRecipeSearch({ growingZoneId, searchMonth });

			expect(searchRecipes).toHaveBeenCalledWith({ growingZoneId, term: undefined, month: 7 }, expect.anything());
		});

		it('returns empty array when no recipes match', async () => {
			vi.mocked(searchRecipes).mockResolvedValueOnce([]);

			const result = await _submitRecipeSearch({ growingZoneId, searchMonth });

			expect(result.success).toBe(true);
			expect(result.data).toEqual([]);
		});
	});

	describe('error handling', () => {
		it('returns a failure response when searchRecipes throws', async () => {
			vi.mocked(searchRecipes).mockRejectedValueOnce(new Error('DB error'));

			const result = await _submitRecipeSearch({ growingZoneId, searchMonth });

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('surfaces the error message in development', async () => {
			vi.mocked(searchRecipes).mockRejectedValueOnce(new Error('DB error'));

			const result = await _submitRecipeSearch({ growingZoneId, searchMonth });

			expect(result.errors?._form?.[0]).toBe('DB error');
		});

		it('hides error details in production', async () => {
			vi.mocked(searchRecipes).mockRejectedValueOnce(new Error('Connection failed: postgres://user:password@db.internal'));
			mockEnv.REZEPT_ENV = 'production';

			const result = await _submitRecipeSearch({ growingZoneId, searchMonth });

			expect(result.errors?._form?.[0]).toBe('Search failed unexpectedly');
			expect(result.errors?._form?.[0]).not.toContain('password');
		});
	});
});
