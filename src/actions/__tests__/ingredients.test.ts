import { beforeEach, describe, expect, it, vi } from 'vitest';
import type RzLogger from '@/logger';
import Logger from '@/logger';

const mockEnv = vi.hoisted(() => ({ REZEPT_ENV: 'development' as string }));
const capturedChain = vi.hoisted(() => ({ handlers: [] as unknown[] }));

vi.mock('@/repositories', () => ({
	createIngredient: vi.fn(),
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
		logger: new Logger(),
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

import { requireAuthentication } from '@/interrupters';
import { createIngredient } from '@/repositories';
import { _addIngredient } from '../ingredients';

const mockIngredient = {
	id: 'mock-ingredient-id',
	name: 'Tomato',
	description: null,
	createdAt: new Date().toISOString(),
	updatedAt: null,
	deletedAt: null,
	createdBy: 'test-user-id',
	updatedBy: null,
	deletedBy: null,
};

describe('_addIngredient', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx.user = { id: 'test-user-id' };
		mockEnv.REZEPT_ENV = 'development';

		vi.mocked(createIngredient).mockResolvedValue(mockIngredient as any);
	});

	describe('authentication', () => {
		it('includes requireAuthentication in the serverAction chain', () => {
			expect(capturedChain.handlers).toContain(requireAuthentication);
		});
	});

	describe('add ingredient', () => {
		it('creates ingredient with a valid name', async () => {
			const result = await _addIngredient('Tomato');

			expect(result.success).toBe(true);
			expect(createIngredient).toHaveBeenCalledTimes(1);
			expect(createIngredient).toHaveBeenCalledWith({ name: 'Tomato' }, 'test-user-id', expect.anything());
		});

		it('returns the created ingredient', async () => {
			const result = await _addIngredient('Tomato');

			expect(result.success).toBe(true);
			expect(result.data).toMatchObject({ id: 'mock-ingredient-id', name: 'Tomato' });
		});

		it('handles repository errors gracefully', async () => {
			vi.mocked(createIngredient).mockRejectedValueOnce(new Error('Database error'));

			const result = await _addIngredient('Tomato');

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('hides error details in production', async () => {
			vi.mocked(createIngredient).mockRejectedValueOnce(new Error('Connection failed: postgres://user:password@db.internal'));
			mockEnv.REZEPT_ENV = 'production';

			const result = await _addIngredient('Tomato');

			expect(result.errors?._form?.[0]).toBe('Failed to add ingredient');
			expect(result.errors?._form?.[0]).not.toContain('postgres://');
			expect(result.errors?._form?.[0]).not.toContain('password');
		});
	});
});
