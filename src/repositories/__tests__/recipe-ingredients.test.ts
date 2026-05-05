import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { getIngredientsByRecipeSectionId, updateRecipeIngredients } from '../recipe-ingredients';
import { updateRecipeSections } from '../recipe-sections';
import { createRecipe } from '../recipes';

const logger = new Logger();

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

	describe('getIngredientsByRecipeSectionId', () => {
		it('returns empty array when section has no ingredients', async () => {
			const result = await getIngredientsByRecipeSectionId(testSectionId, logger);
			expect(result).toEqual([]);
		});

		it('returns all ingredients for section', async () => {
			await updateRecipeIngredients(
				testSectionId,
				[
					{ order: 1, raw: '2 cups flour' },
					{ order: 2, raw: '1 tsp salt' },
				],
				testUserId,
				logger,
			);

			const result = await getIngredientsByRecipeSectionId(testSectionId, logger);
			expect(result).toHaveLength(2);
		});

		it('returns ingredients with unit relation (null when no unit)', async () => {
			await updateRecipeIngredients(testSectionId, [{ order: 1, raw: '2 cups flour' }], testUserId, logger);

			const result = await getIngredientsByRecipeSectionId(testSectionId, logger);
			expect(result[0]).toHaveProperty('unitId');
			expect(result[0].unitId).toBeNull();
		});

		it('returns only ingredients for the specified section', async () => {
			const recipe = await createRecipe({ authorId: testUserId, title: 'Other Recipe' }, testUserId, logger);
			const [otherSection] = await updateRecipeSections(recipe.id, [{ title: 'Other', order: 1 }], testUserId, logger);

			await updateRecipeIngredients(testSectionId, [{ order: 1, raw: 'Mine' }], testUserId, logger);
			await updateRecipeIngredients(otherSection.id, [{ order: 1, raw: 'Theirs' }], testUserId, logger);

			const result = await getIngredientsByRecipeSectionId(testSectionId, logger);
			expect(result).toHaveLength(1);
			expect(result[0].raw).toBe('Mine');
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

			const remaining = await getIngredientsByRecipeSectionId(testSectionId, logger);
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

			const all = await getIngredientsByRecipeSectionId(testSectionId, logger);
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

			const otherIngredients = await getIngredientsByRecipeSectionId(otherSection.id, logger);
			expect(otherIngredients).toHaveLength(1);
			expect(otherIngredients[0].raw).toBe('Other ingredient');
		});
	});
});
