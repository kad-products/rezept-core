import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import { RzRepositoryError } from '@/classes';
import db from '@/db';
import { createNoopLogger } from '@/logger';
import { createIngredient, createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { getRecipeIngredientsByRecipeSectionId, updateRecipeIngredient, updateRecipeIngredients } from '../recipe-ingredients';
import { updateRecipeSections } from '../recipe-sections';
import { createRecipe } from '../recipes';

const logger = createNoopLogger();

describe('recipe-ingredients repository', () => {
	let testUserId: string;
	let testSectionId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		testUserId = user.id;
		const recipe = await createRecipe({ authorId: testUserId, title: 'Test Recipe' }, testUserId, logger);
		const [section] = await updateRecipeSections(recipe.id, [{ title: 'Main', order: 1 }], testUserId, logger);
		testSectionId = section.id;
	});

	describe('getRecipeIngredientsByRecipeSectionId', () => {
		it('returns empty array when no ingredients exist for the section', async () => {
			const result = await getRecipeIngredientsByRecipeSectionId(testSectionId, logger);
			expect(result).toEqual([]);
		});

		it('returns ingredients for the specified section', async () => {
			await updateRecipeIngredients(
				testSectionId,
				[
					{ order: 1, raw: 'flour' },
					{ order: 2, raw: 'salt' },
				],
				testUserId,
				logger,
			);

			const result = await getRecipeIngredientsByRecipeSectionId(testSectionId, logger);
			expect(result).toHaveLength(2);
		});

		it('returns ingredients with correct shape', async () => {
			await updateRecipeIngredients(testSectionId, [{ order: 1, raw: '2 cups flour' }], testUserId, logger);

			const result = await getRecipeIngredientsByRecipeSectionId(testSectionId, logger);
			expect(result[0]).toMatchObject({
				recipeSectionId: testSectionId,
				raw: '2 cups flour',
				order: 1,
			});
			expect(result[0].id).toBeDefined();
		});

		it('does not return soft-deleted ingredients', async () => {
			await updateRecipeIngredients(testSectionId, [{ order: 1, raw: 'flour' }], testUserId, logger);
			// soft-delete all ingredients for the section by passing an empty list
			await updateRecipeIngredients(testSectionId, [], testUserId, logger);

			const result = await getRecipeIngredientsByRecipeSectionId(testSectionId, logger);
			expect(result).toHaveLength(0);
		});

		it('does not return ingredients from other sections', async () => {
			const otherRecipe = await createRecipe({ authorId: testUserId, title: 'Other Recipe' }, testUserId, logger);
			const [otherSection] = await updateRecipeSections(otherRecipe.id, [{ title: 'Other', order: 1 }], testUserId, logger);
			await updateRecipeIngredients(otherSection.id, [{ order: 1, raw: 'other ingredient' }], testUserId, logger);

			const result = await getRecipeIngredientsByRecipeSectionId(testSectionId, logger);
			expect(result).toHaveLength(0);
		});
	});

	describe('updateRecipeIngredients', () => {
		it('inserts new ingredients when none exist', async () => {
			const result = await updateRecipeIngredients(
				testSectionId,
				[
					{ order: 1, raw: '2 cups flour' },
					{ order: 2, raw: '1 tsp salt' },
				],
				testUserId,
				logger,
			);

			expect(result).toHaveLength(2);
		});

		it('sets recipeSectionId and createdBy on new ingredients', async () => {
			const result = await updateRecipeIngredients(testSectionId, [{ order: 1, raw: '2 cups flour' }], testUserId, logger);

			expect(result[0].recipeSectionId).toBe(testSectionId);
			expect(result[0].createdBy).toBe(testUserId);
		});

		it('stores optional ingredient fields', async () => {
			const result = await updateRecipeIngredients(
				testSectionId,
				[{ order: 1, raw: '2 cups flour', quantity: 2, preparation: 'sifted', modifier: 'optional' }],
				testUserId,
				logger,
			);

			expect(result[0].quantity).toBe(2);
			expect(result[0].preparation).toBe('sifted');
			expect(result[0].modifier).toBe('optional');
		});

		it('updates existing ingredients when id is provided', async () => {
			const initial = await updateRecipeIngredients(testSectionId, [{ order: 1, raw: 'Original' }], testUserId, logger);
			const ingredientId = initial[0].id;

			const result = await updateRecipeIngredients(
				testSectionId,
				[{ id: ingredientId, order: 1, raw: 'Updated' }],
				testUserId,
				logger,
			);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(ingredientId);
			expect(result[0].raw).toBe('Updated');
		});

		it('sets updatedBy on updated ingredients', async () => {
			const initial = await updateRecipeIngredients(testSectionId, [{ order: 1, raw: 'Original' }], testUserId, logger);

			const result = await updateRecipeIngredients(
				testSectionId,
				[{ id: initial[0].id, order: 1, raw: 'Updated' }],
				testUserId,
				logger,
			);

			expect(result[0].updatedBy).toBe(testUserId);
		});

		it('deletes ingredients not present in the new list', async () => {
			const initial = await updateRecipeIngredients(
				testSectionId,
				[
					{ order: 1, raw: 'Keep' },
					{ order: 2, raw: 'Remove' },
				],
				testUserId,
				logger,
			);

			const keepId = initial[0].id;

			await updateRecipeIngredients(testSectionId, [{ id: keepId, order: 1, raw: 'Keep' }], testUserId, logger);

			const remaining = await db.query.recipeIngredients.findMany({
				where: (i, { and, eq, isNull }) => and(eq(i.recipeSectionId, testSectionId), isNull(i.deletedAt)),
			});
			expect(remaining).toHaveLength(1);
			expect(remaining[0].id).toBe(keepId);
		});

		it('handles mixed insert, update, and delete', async () => {
			const initial = await updateRecipeIngredients(
				testSectionId,
				[
					{ order: 1, raw: 'Keep and Update' },
					{ order: 2, raw: 'Delete Me' },
				],
				testUserId,
				logger,
			);

			const keepId = initial[0].id;

			await updateRecipeIngredients(
				testSectionId,
				[
					{ id: keepId, order: 1, raw: 'Now Updated' },
					{ order: 2, raw: 'Brand New' },
				],
				testUserId,
				logger,
			);

			const all = await db.query.recipeIngredients.findMany({
				where: (i, { and, eq, isNull }) => and(eq(i.recipeSectionId, testSectionId), isNull(i.deletedAt)),
			});
			expect(all).toHaveLength(2);

			const raws = all.map(i => i.raw);
			expect(raws).toContain('Now Updated');
			expect(raws).toContain('Brand New');
		});

		it('does not affect ingredients in other sections', async () => {
			const recipe = await createRecipe({ authorId: testUserId, title: 'Other Recipe' }, testUserId, logger);
			const [otherSection] = await updateRecipeSections(recipe.id, [{ title: 'Other', order: 1 }], testUserId, logger);
			await updateRecipeIngredients(otherSection.id, [{ order: 1, raw: 'Other ingredient' }], testUserId, logger);

			await updateRecipeIngredients(testSectionId, [{ order: 1, raw: 'My ingredient' }], testUserId, logger);

			const otherIngredients = await db.query.recipeIngredients.findMany({
				where: (i, { and, eq, isNull }) => and(eq(i.recipeSectionId, otherSection.id), isNull(i.deletedAt)),
			});
			expect(otherIngredients).toHaveLength(1);
			expect(otherIngredients[0].raw).toBe('Other ingredient');
		});
	});

	describe('updateRecipeIngredient', () => {
		let testRecipeIngredientId: string;

		beforeEach(async () => {
			const [ri] = await updateRecipeIngredients(testSectionId, [{ order: 1, raw: '2 cups flour' }], testUserId, logger);
			testRecipeIngredientId = ri.id;
		});

		it('updates the specified field', async () => {
			const result = await updateRecipeIngredient(testRecipeIngredientId, { raw: 'updated raw' }, testUserId, logger);
			expect(result.raw).toBe('updated raw');
		});

		it('does not alter fields absent from the update payload', async () => {
			const result = await updateRecipeIngredient(testRecipeIngredientId, { raw: 'updated raw' }, testUserId, logger);
			expect(result.order).toBe(1);
		});

		it('sets updatedBy on the record', async () => {
			const result = await updateRecipeIngredient(testRecipeIngredientId, { raw: 'updated raw' }, testUserId, logger);
			expect(result.updatedBy).toBe(testUserId);
		});

		it('returns the full updated record', async () => {
			const result = await updateRecipeIngredient(testRecipeIngredientId, { raw: 'updated raw' }, testUserId, logger);
			expect(result.id).toBe(testRecipeIngredientId);
			expect(result.recipeSectionId).toBe(testSectionId);
		});

		it('updates ingredientId when provided', async () => {
			const ingredient = await createIngredient({ name: 'Flour' }, testUserId, logger);
			const result = await updateRecipeIngredient(testRecipeIngredientId, { ingredientId: ingredient.id }, testUserId, logger);
			expect(result.ingredientId).toBe(ingredient.id);
		});

		it('throws RzRepositoryError for an invalid UUID', async () => {
			await expect(updateRecipeIngredient('not-a-uuid', { raw: 'x' }, testUserId, logger)).rejects.toThrow(RzRepositoryError);
		});

		it('throws RzRepositoryError when the record does not exist', async () => {
			await expect(updateRecipeIngredient(randomUUID(), { raw: 'x' }, testUserId, logger)).rejects.toThrow(RzRepositoryError);
		});
	});
});
