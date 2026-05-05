import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { getSectionsByRecipeId, updateRecipeSections } from '../recipe-sections';
import { createRecipe } from '../recipes';

const logger = new Logger();

describe('recipe-sections repository', () => {
	let testUserId: string;
	let testRecipeId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		testUserId = user.id;
		const recipe = await createRecipe({ authorId: testUserId, title: 'Test Recipe' }, testUserId, logger);
		testRecipeId = recipe.id;
	});

	describe('getSectionsByRecipeId', () => {
		it('returns empty array when recipe has no sections', async () => {
			const result = await getSectionsByRecipeId(testRecipeId, logger);
			expect(result).toEqual([]);
		});

		it('returns all sections for recipe', async () => {
			await updateRecipeSections(
				testRecipeId,
				[
					{ title: 'Section A', order: 1 },
					{ title: 'Section B', order: 2 },
				],
				testUserId,
				logger,
			);

			const result = await getSectionsByRecipeId(testRecipeId, logger);
			expect(result).toHaveLength(2);
		});

		it('returns sections sorted by order', async () => {
			await updateRecipeSections(
				testRecipeId,
				[
					{ title: 'Third', order: 3 },
					{ title: 'First', order: 1 },
					{ title: 'Second', order: 2 },
				],
				testUserId,
				logger,
			);

			const result = await getSectionsByRecipeId(testRecipeId, logger);
			expect(result[0].order).toBe(1);
			expect(result[1].order).toBe(2);
			expect(result[2].order).toBe(3);
		});

		it('returns only sections for the specified recipe', async () => {
			const otherRecipe = await createRecipe({ authorId: testUserId, title: 'Other Recipe' }, testUserId, logger);

			await updateRecipeSections(testRecipeId, [{ title: 'My Section', order: 1 }], testUserId, logger);
			await updateRecipeSections(otherRecipe.id, [{ title: 'Other Section', order: 1 }], testUserId, logger);

			const result = await getSectionsByRecipeId(testRecipeId, logger);
			expect(result).toHaveLength(1);
			expect(result[0].title).toBe('My Section');
		});
	});

	describe('updateRecipeSections', () => {
		it('inserts new sections when none exist', async () => {
			const result = await updateRecipeSections(
				testRecipeId,
				[
					{ title: 'Prep', order: 1 },
					{ title: 'Cook', order: 2 },
				],
				testUserId,
				logger,
			);

			expect(result).toHaveLength(2);
			expect(result[0].title).toBe('Prep');
			expect(result[1].title).toBe('Cook');
		});

		it('sets recipeId and createdBy on new sections', async () => {
			const result = await updateRecipeSections(testRecipeId, [{ title: 'Main', order: 1 }], testUserId, logger);

			expect(result[0].recipeId).toBe(testRecipeId);
			expect(result[0].createdBy).toBe(testUserId);
		});

		it('assigns unique ids to new sections', async () => {
			const result = await updateRecipeSections(
				testRecipeId,
				[
					{ title: 'Section 1', order: 1 },
					{ title: 'Section 2', order: 2 },
				],
				testUserId,
				logger,
			);

			expect(result[0].id).not.toBe(result[1].id);
		});

		it('updates existing sections when id is provided', async () => {
			const initial = await updateRecipeSections(testRecipeId, [{ title: 'Original', order: 1 }], testUserId, logger);
			const sectionId = initial[0].id;

			const result = await updateRecipeSections(
				testRecipeId,
				[{ id: sectionId, title: 'Updated', order: 1 }],
				testUserId,
				logger,
			);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(sectionId);
			expect(result[0].title).toBe('Updated');
		});

		it('sets updatedBy on updated sections', async () => {
			const initial = await updateRecipeSections(testRecipeId, [{ title: 'Original', order: 1 }], testUserId, logger);

			const result = await updateRecipeSections(
				testRecipeId,
				[{ id: initial[0].id, title: 'Updated', order: 1 }],
				testUserId,
				logger,
			);

			expect(result[0].updatedBy).toBe(testUserId);
		});

		it('deletes sections not present in the new list', async () => {
			const initial = await updateRecipeSections(
				testRecipeId,
				[
					{ title: 'Keep', order: 1 },
					{ title: 'Remove', order: 2 },
				],
				testUserId,
				logger,
			);

			const keepId = initial[0].id;

			await updateRecipeSections(testRecipeId, [{ id: keepId, title: 'Keep', order: 1 }], testUserId, logger);

			const remaining = await getSectionsByRecipeId(testRecipeId, logger);
			expect(remaining).toHaveLength(1);
			expect(remaining[0].id).toBe(keepId);
		});

		it('handles mixed insert, update, and delete', async () => {
			const initial = await updateRecipeSections(
				testRecipeId,
				[
					{ title: 'Keep and Update', order: 1 },
					{ title: 'Delete Me', order: 2 },
				],
				testUserId,
				logger,
			);

			const keepId = initial[0].id;

			const result = await updateRecipeSections(
				testRecipeId,
				[
					{ id: keepId, title: 'Now Updated', order: 1 },
					{ title: 'Brand New', order: 2 },
				],
				testUserId,
				logger,
			);

			expect(result).toHaveLength(2);

			const allSections = await getSectionsByRecipeId(testRecipeId, logger);
			expect(allSections).toHaveLength(2);

			const titles = allSections.map(s => s.title);
			expect(titles).toContain('Now Updated');
			expect(titles).toContain('Brand New');
		});

		it('allows null title on sections', async () => {
			const result = await updateRecipeSections(testRecipeId, [{ title: null, order: 1 }], testUserId, logger);
			expect(result[0].title).toBeNull();
		});

		it('does not affect sections of other recipes', async () => {
			const otherRecipe = await createRecipe({ authorId: testUserId, title: 'Other Recipe' }, testUserId, logger);
			await updateRecipeSections(otherRecipe.id, [{ title: 'Other Section', order: 1 }], testUserId, logger);

			await updateRecipeSections(testRecipeId, [{ title: 'My Section', order: 1 }], testUserId, logger);

			const otherSections = await getSectionsByRecipeId(otherRecipe.id, logger);
			expect(otherSections).toHaveLength(1);
			expect(otherSections[0].title).toBe('Other Section');
		});
	});
});
