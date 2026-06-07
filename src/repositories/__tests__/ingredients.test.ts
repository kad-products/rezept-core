import { beforeEach, describe, expect, it } from 'vitest';
import { createNoopLogger } from '@/logger';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { createIngredient, getIngredients } from '../ingredients';

const logger = createNoopLogger();

describe('ingredients repository', () => {
	let testUserId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		testUserId = user.id;
	});

	describe('getIngredients', () => {
		it('returns empty array when no ingredients exist', async () => {
			const result = await getIngredients(logger);
			expect(result).toEqual([]);
		});

		it('returns all ingredients', async () => {
			await createIngredient({ name: 'Tomato' }, testUserId, logger);
			await createIngredient({ name: 'Onion' }, testUserId, logger);
			await createIngredient({ name: 'Garlic' }, testUserId, logger);

			const result = await getIngredients(logger);
			expect(result).toHaveLength(3);
		});

		it('returns ingredients with correct shape', async () => {
			await createIngredient({ name: 'Tomato', description: 'A red fruit' }, testUserId, logger);

			const result = await getIngredients(logger);
			expect(result[0]).toMatchObject({
				name: 'Tomato',
				description: 'A red fruit',
				createdBy: testUserId,
			});
			expect(result[0].id).toBeDefined();
		});
	});

	describe('createIngredient', () => {
		it('creates an ingredient with required fields', async () => {
			const result = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			expect(result.id).toBeDefined();
			expect(result.name).toBe('Tomato');
		});

		it('sets createdBy to userId', async () => {
			const result = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			expect(result.createdBy).toBe(testUserId);
		});

		it('sets audit fields correctly', async () => {
			const result = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeNull();
			expect(result.deletedAt).toBeNull();
		});

		it('creates ingredient with optional description', async () => {
			const result = await createIngredient({ name: 'Tomato', description: 'A red fruit' }, testUserId, logger);
			expect(result.description).toBe('A red fruit');
		});

		it('creates ingredient without description', async () => {
			const result = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			expect(result.description).toBeNull();
		});

		it('creates multiple ingredients with unique ids', async () => {
			const ing1 = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const ing2 = await createIngredient({ name: 'Onion' }, testUserId, logger);

			expect(ing1.id).not.toBe(ing2.id);
		});

		it('throws on duplicate name', async () => {
			await createIngredient({ name: 'Tomato' }, testUserId, logger);

			await expect(createIngredient({ name: 'Tomato' }, testUserId, logger)).rejects.toThrow();
		});
	});
});
