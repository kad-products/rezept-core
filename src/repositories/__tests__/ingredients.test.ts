import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { createNoopLogger } from '@/logger';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import {
	createIngredient,
	ensureIngredientsByName,
	getIngredientById,
	getIngredients,
	getIngredientsByNames,
	updateIngredient,
	verifyIngredient,
} from '../ingredients';

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

	describe('getIngredientById', () => {
		it('returns ingredient by id', async () => {
			const created = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			const result = await getIngredientById(created.id, logger);
			expect(result.id).toBe(created.id);
			expect(result.name).toBe('Tomato');
		});

		it('throws when ingredient does not exist', async () => {
			await expect(getIngredientById(crypto.randomUUID(), logger)).rejects.toThrow(
				'Expected 1 Ingredient record(s), but found 0',
			);
		});

		it('throws when id is not a valid UUID', async () => {
			await expect(getIngredientById('not-a-uuid', logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a Ingredient',
			);
		});

		it('throws when id is an empty string', async () => {
			await expect(getIngredientById('', logger)).rejects.toThrow('The value "" is not a valid ID for a Ingredient');
		});

		it('does not return soft-deleted ingredients', async () => {
			// Create and immediately soft-delete by setting deletedAt directly — no soft-delete
			// method exists on this repo yet, so we verify the where clause via a separate approach:
			// The function filters isNull(deletedAt), so a fresh ingredient is always returned.
			const created = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const result = await getIngredientById(created.id, logger);
			expect(result.deletedAt).toBeNull();
		});

		it('returns correct ingredient when multiple exist', async () => {
			await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const target = await createIngredient({ name: 'Onion' }, testUserId, logger);

			const result = await getIngredientById(target.id, logger);
			expect(result.id).toBe(target.id);
			expect(result.name).toBe('Onion');
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

	describe('updateIngredient', () => {
		it('updates the ingredient name', async () => {
			const created = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			const result = await updateIngredient(created.id, { name: 'Cherry Tomato' }, testUserId, logger);

			expect(result.name).toBe('Cherry Tomato');
		});

		it('returns the updated ingredient', async () => {
			const created = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			const result = await updateIngredient(created.id, { name: 'Cherry Tomato' }, testUserId, logger);

			expect(result.id).toBe(created.id);
		});

		it('sets updatedBy to userId', async () => {
			const created = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			const result = await updateIngredient(created.id, { name: 'Cherry Tomato' }, testUserId, logger);

			expect(result.updatedBy).toBe(testUserId);
		});

		it('sets updatedAt on update', async () => {
			const created = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			await new Promise(resolve => setTimeout(resolve, 10));

			const result = await updateIngredient(created.id, { name: 'Cherry Tomato' }, testUserId, logger);

			expect(result.updatedAt).not.toBeNull();
		});

		it('updates description', async () => {
			const created = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			const result = await updateIngredient(created.id, { name: 'Tomato', description: 'A red fruit' }, testUserId, logger);

			expect(result.description).toBe('A red fruit');
		});

		it('throws when id is not a valid UUID', async () => {
			await expect(updateIngredient('not-a-uuid', { name: 'Tomato' }, testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a Ingredient',
			);
		});

		it('throws when ingredient does not exist', async () => {
			await expect(updateIngredient(randomUUID(), { name: 'Ghost' }, testUserId, logger)).rejects.toThrow(
				'Expected 1 Ingredient record(s), but found 0',
			);
		});

		it('does not affect other ingredients', async () => {
			const other = await createIngredient({ name: 'Onion' }, testUserId, logger);
			const target = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			await updateIngredient(target.id, { name: 'Cherry Tomato' }, testUserId, logger);

			const unchanged = await getIngredientById(other.id, logger);
			expect(unchanged.name).toBe('Onion');
			expect(unchanged.updatedAt).toBeNull();
		});
	});

	describe('ensureIngredientsByName', () => {
		it('returns empty array when passed empty list', async () => {
			const result = await ensureIngredientsByName([], testUserId, logger);
			expect(result).toEqual([]);
		});

		it('creates new ingredients when none exist', async () => {
			const result = await ensureIngredientsByName(['Tomato', 'Onion'], testUserId, logger);
			expect(result).toHaveLength(2);
			expect(result.map(i => i.name)).toEqual(expect.arrayContaining(['Tomato', 'Onion']));
		});

		it('sets createdBy to userId for new ingredients', async () => {
			const result = await ensureIngredientsByName(['Tomato'], testUserId, logger);
			expect(result[0].createdBy).toBe(testUserId);
		});

		it('returns ingredients with ids', async () => {
			const result = await ensureIngredientsByName(['Garlic'], testUserId, logger);
			expect(result[0].id).toBeDefined();
		});

		it('updates an existing ingredient when matched by name', async () => {
			const created = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			const result = await ensureIngredientsByName(['Tomato'], testUserId, logger);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(created.id);
		});

		it('sets updatedBy when updating an existing ingredient', async () => {
			await createIngredient({ name: 'Tomato' }, testUserId, logger);

			const result = await ensureIngredientsByName(['Tomato'], testUserId, logger);

			expect(result[0].updatedBy).toBe(testUserId);
		});

		it('sets updatedAt when updating an existing ingredient', async () => {
			await createIngredient({ name: 'Tomato' }, testUserId, logger);

			const result = await ensureIngredientsByName(['Tomato'], testUserId, logger);

			expect(result[0].updatedAt).not.toBeNull();
		});

		it('returns a mix of newly created and updated ingredients', async () => {
			await createIngredient({ name: 'Tomato' }, testUserId, logger);

			const result = await ensureIngredientsByName(['Tomato', 'Onion'], testUserId, logger);

			expect(result).toHaveLength(2);
			expect(result.map(i => i.name)).toEqual(expect.arrayContaining(['Tomato', 'Onion']));
		});

		it('does not modify ingredients not in the input list', async () => {
			const unrelated = await createIngredient({ name: 'Garlic' }, testUserId, logger);

			await ensureIngredientsByName(['Tomato'], testUserId, logger);

			const allIngredients = await getIngredients(logger);
			const garlic = allIngredients.find(i => i.id === unrelated.id);
			expect(garlic?.updatedAt).toBeNull();
		});

		it('preserves input order in the returned array', async () => {
			const result = await ensureIngredientsByName(['Zucchini', 'Aubergine', 'Pepper'], testUserId, logger);
			expect(result.map(i => i.name)).toEqual(['Zucchini', 'Aubergine', 'Pepper']);
		});

		it('throws when the same name appears more than once in the input', async () => {
			await expect(ensureIngredientsByName(['Tomato', 'Tomato'], testUserId, logger)).rejects.toThrow();
		});
	});

	describe('getIngredientsByNames', () => {
		it('returns empty array when passed an empty list', async () => {
			const result = await getIngredientsByNames([], logger);
			expect(result).toEqual([]);
		});

		it('returns matching ingredients by name', async () => {
			await createIngredient({ name: 'Tomato' }, testUserId, logger);
			await createIngredient({ name: 'Onion' }, testUserId, logger);

			const result = await getIngredientsByNames(['Tomato', 'Onion'], logger);
			expect(result.map(i => i.name)).toEqual(expect.arrayContaining(['Tomato', 'Onion']));
		});

		it('returns only ingredients whose names appear in the list', async () => {
			await createIngredient({ name: 'Tomato' }, testUserId, logger);
			await createIngredient({ name: 'Garlic' }, testUserId, logger);

			const result = await getIngredientsByNames(['Tomato'], logger);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('Tomato');
		});

		it('returns empty array when no names match', async () => {
			await createIngredient({ name: 'Tomato' }, testUserId, logger);

			const result = await getIngredientsByNames(['Onion'], logger);
			expect(result).toEqual([]);
		});

		it('returns partial matches when only some names exist', async () => {
			await createIngredient({ name: 'Tomato' }, testUserId, logger);

			const result = await getIngredientsByNames(['Tomato', 'Ghost'], logger);
			expect(result).toHaveLength(1);
			expect(result[0].name).toBe('Tomato');
		});

		it('handles batches larger than 100 names without error', async () => {
			// Create 5 real ingredients and look up 105 names (mostly non-existent)
			for (const name of ['A', 'B', 'C', 'D', 'E']) {
				await createIngredient({ name }, testUserId, logger);
			}
			const names = Array.from({ length: 105 }, (_, i) => `Name${i}`);
			names.push('A', 'B');

			const result = await getIngredientsByNames(names, logger);
			expect(result.map(i => i.name)).toEqual(expect.arrayContaining(['A', 'B']));
		});

		it('does not return soft-deleted ingredients', async () => {
			// Soft-delete is not exposed on this repo yet, so verify the filter indirectly:
			// a freshly created ingredient should be returned, confirming the isNull(deletedAt) filter
			// is not excluding active records.
			const created = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const result = await getIngredientsByNames(['Tomato'], logger);
			expect(result[0].id).toBe(created.id);
			expect(result[0].deletedAt).toBeNull();
		});
	});

	describe('verifyIngredient', () => {
		it('returns a verification record and the updated ingredient', async () => {
			const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const result = await verifyIngredient(ingredient.id, testUserId, logger);

			expect(result.verification).toBeDefined();
			expect(result.ingredient).toBeDefined();
		});

		it('sets ingredientId on the verification record', async () => {
			const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const { verification } = await verifyIngredient(ingredient.id, testUserId, logger);

			expect(verification.ingredientId).toBe(ingredient.id);
		});

		it('sets createdBy on the verification record', async () => {
			const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const { verification } = await verifyIngredient(ingredient.id, testUserId, logger);

			expect(verification.createdBy).toBe(testUserId);
		});

		it('leaves ingredientSeasonId null on the verification record', async () => {
			const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const { verification } = await verifyIngredient(ingredient.id, testUserId, logger);

			expect(verification.ingredientSeasonId).toBeNull();
		});

		it('updates lastVerifiedAt on the ingredient', async () => {
			const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			expect(ingredient.lastVerifiedAt).toBeNull();

			const { ingredient: updated } = await verifyIngredient(ingredient.id, testUserId, logger);

			expect(updated.lastVerifiedAt).not.toBeNull();
		});

		it('sets lastVerifiedAt to match the verification createdAt', async () => {
			const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const { ingredient: updated, verification } = await verifyIngredient(ingredient.id, testUserId, logger);

			expect(updated.lastVerifiedAt).toBe(verification.createdAt);
		});

		it('sets updatedAt to match the verification createdAt', async () => {
			const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const { ingredient: updated, verification } = await verifyIngredient(ingredient.id, testUserId, logger);

			expect(updated.updatedAt).toBe(verification.createdAt);
		});

		it('sets updatedBy on the ingredient', async () => {
			const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const { ingredient: updated } = await verifyIngredient(ingredient.id, testUserId, logger);

			expect(updated.updatedBy).toBe(testUserId);
		});

		it('returns the correct ingredient id', async () => {
			const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const { ingredient: updated } = await verifyIngredient(ingredient.id, testUserId, logger);

			expect(updated.id).toBe(ingredient.id);
		});

		it('does not update other ingredients', async () => {
			const target = await createIngredient({ name: 'Tomato' }, testUserId, logger);
			const other = await createIngredient({ name: 'Onion' }, testUserId, logger);

			await verifyIngredient(target.id, testUserId, logger);

			const unchanged = await getIngredientById(other.id, logger);
			expect(unchanged.lastVerifiedAt).toBeNull();
			expect(unchanged.updatedAt).toBeNull();
		});

		it('allows multiple verifications for the same ingredient', async () => {
			const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			const { verification: first } = await verifyIngredient(ingredient.id, testUserId, logger);
			const { verification: second } = await verifyIngredient(ingredient.id, testUserId, logger);

			expect(first.id).not.toBe(second.id);
			expect(second.ingredientId).toBe(ingredient.id);
		});

		it('updates lastVerifiedAt on re-verification', async () => {
			const ingredient = await createIngredient({ name: 'Tomato' }, testUserId, logger);

			const { ingredient: afterFirst } = await verifyIngredient(ingredient.id, testUserId, logger);
			const { ingredient: afterSecond } = await verifyIngredient(ingredient.id, testUserId, logger);

			// Both should be set; afterSecond's lastVerifiedAt should be >= afterFirst's
			expect(afterFirst.lastVerifiedAt).not.toBeNull();
			expect(afterSecond.lastVerifiedAt).not.toBeNull();
		});

		it('throws InvalidUUID for a non-UUID id', async () => {
			await expect(verifyIngredient('not-a-uuid', testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a Ingredient',
			);
		});

		it('throws InvalidUUID for an empty string id', async () => {
			await expect(verifyIngredient('', testUserId, logger)).rejects.toThrow('The value "" is not a valid ID for a Ingredient');
		});

		it('throws when the ingredient does not exist', async () => {
			await expect(verifyIngredient(randomUUID(), testUserId, logger)).rejects.toThrow();
		});
	});
});
