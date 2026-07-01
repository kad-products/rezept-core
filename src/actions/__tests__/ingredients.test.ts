import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNoopLogger } from '@/logger';
import type { RzLogger } from '@/types';

const mockEnv = vi.hoisted(() => ({ REZEPT_ENV: 'development' as string }));
const capturedChain = vi.hoisted(() => ({ handlers: [] as unknown[] }));

vi.mock('@/repositories', () => ({
	createIngredient: vi.fn(),
	updateIngredient: vi.fn(),
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
import { createIngredient, updateIngredient } from '@/repositories';
import { _saveIngredient } from '../ingredients';

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

describe('_saveIngredient', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx.user = { id: 'test-user-id' };
		mockEnv.REZEPT_ENV = 'development';

		vi.mocked(createIngredient).mockResolvedValue(mockIngredient as any);
		vi.mocked(updateIngredient).mockResolvedValue(mockIngredient as any);
	});

	describe('authentication', () => {
		it('includes requireAuthentication in the serverAction chain', () => {
			expect(capturedChain.handlers).toContain(requireAuthentication);
		});
	});

	describe('create ingredient', () => {
		it('creates ingredient with a valid name', async () => {
			const result = await _saveIngredient({ name: 'Tomato' });

			expect(result.success).toBe(true);
			expect(createIngredient).toHaveBeenCalledTimes(1);
			expect(createIngredient).toHaveBeenCalledWith({ name: 'Tomato' }, 'test-user-id', expect.anything());
		});

		it('returns 201 status on create', async () => {
			const result = await _saveIngredient({ name: 'Tomato' });

			expect(result.code).toBe(201);
		});

		it('returns the created ingredient', async () => {
			const result = await _saveIngredient({ name: 'Tomato' });

			expect(result.success).toBe(true);
			expect(result.data).toMatchObject({ id: 'mock-ingredient-id', name: 'Tomato' });
		});

		it('does not call updateIngredient when no id is provided', async () => {
			await _saveIngredient({ name: 'Tomato' });

			expect(updateIngredient).not.toHaveBeenCalled();
		});

		it('returns a validation error when name is empty', async () => {
			const result = await _saveIngredient({ name: '' });

			expect(result.success).toBe(false);
			expect(result.errors?.name).toBeDefined();
			expect(createIngredient).not.toHaveBeenCalled();
		});

		it('returns a validation error when name is missing', async () => {
			const result = await _saveIngredient({} as any);

			expect(result.success).toBe(false);
			expect(result.errors?.name).toBeDefined();
			expect(createIngredient).not.toHaveBeenCalled();
		});

		it('handles repository errors gracefully', async () => {
			vi.mocked(createIngredient).mockRejectedValueOnce(new Error('Database error'));

			const result = await _saveIngredient({ name: 'Tomato' });

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('hides error details in production', async () => {
			vi.mocked(createIngredient).mockRejectedValueOnce(new Error('Connection failed: postgres://user:password@db.internal'));
			mockEnv.REZEPT_ENV = 'production';

			const result = await _saveIngredient({ name: 'Tomato' });

			expect(result.errors?._form?.[0]).toBe('Failed to add ingredient');
			expect(result.errors?._form?.[0]).not.toContain('postgres://');
			expect(result.errors?._form?.[0]).not.toContain('password');
		});
	});

	describe('update ingredient', () => {
		it('updates ingredient when a valid id is provided', async () => {
			const ingredientId = randomUUID();

			const result = await _saveIngredient({ id: ingredientId, name: 'Updated Tomato' });

			expect(result.success).toBe(true);
			expect(updateIngredient).toHaveBeenCalledTimes(1);
			expect(updateIngredient).toHaveBeenCalledWith(
				ingredientId,
				expect.objectContaining({ name: 'Updated Tomato' }),
				'test-user-id',
				expect.anything(),
			);
		});

		it('returns 200 status on update', async () => {
			const result = await _saveIngredient({ id: randomUUID(), name: 'Updated Tomato' });

			expect(result.code).toBe(200);
		});

		it('returns the updated ingredient', async () => {
			const result = await _saveIngredient({ id: randomUUID(), name: 'Updated Tomato' });

			expect(result.success).toBe(true);
			expect(result.data).toMatchObject({ id: 'mock-ingredient-id' });
		});

		it('does not call createIngredient when an id is provided', async () => {
			await _saveIngredient({ id: randomUUID(), name: 'Updated Tomato' });

			expect(createIngredient).not.toHaveBeenCalled();
		});

		it('passes description through on update', async () => {
			const ingredientId = randomUUID();

			await _saveIngredient({ id: ingredientId, name: 'Tomato', description: 'A red fruit' });

			expect(updateIngredient).toHaveBeenCalledWith(
				ingredientId,
				expect.objectContaining({ description: 'A red fruit' }),
				'test-user-id',
				expect.anything(),
			);
		});

		it('handles repository errors on update gracefully', async () => {
			vi.mocked(updateIngredient).mockRejectedValueOnce(new Error('Update failed'));

			const result = await _saveIngredient({ id: randomUUID(), name: 'Updated Tomato' });

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('returns a validation error when id is not a valid UUID', async () => {
			const result = await _saveIngredient({ id: 'not-a-uuid', name: 'Tomato' });

			expect(result.success).toBe(false);
			expect(result.errors?.id).toBeDefined();
			expect(updateIngredient).not.toHaveBeenCalled();
		});
	});
});
