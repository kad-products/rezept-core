import { beforeEach, describe, expect, it } from 'vitest';
import { createNoopLogger } from '@/logger';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { updateRecipeCookingMethods } from '../recipe-cooking-methods';
import { updateRecipeSections } from '../recipe-sections';
import { createRecipe } from '../recipes';

const logger = createNoopLogger();

describe('recipe-cooking-methods repository', () => {
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

	describe('updateRecipeCookingMethods', () => {
		it('returns empty array when called with no methods and none exist', async () => {
			const result = await updateRecipeCookingMethods(testSectionId, [], testUserId, logger);
			expect(result).toEqual([]);
		});

		it('inserts new methods when none exist', async () => {
			const result = await updateRecipeCookingMethods(
				testSectionId,
				[
					{ name: 'Standard', order: 1 },
					{ name: 'Grilling', order: 2 },
				],
				testUserId,
				logger,
			);

			expect(result).toHaveLength(2);
			expect(result[0].name).toBe('Standard');
			expect(result[1].name).toBe('Grilling');
		});

		it('sets recipeSectionId and createdBy on new methods', async () => {
			const result = await updateRecipeCookingMethods(testSectionId, [{ name: 'Standard', order: 1 }], testUserId, logger);

			expect(result[0].recipeSectionId).toBe(testSectionId);
			expect(result[0].createdBy).toBe(testUserId);
		});

		it('assigns unique ids to new methods', async () => {
			const result = await updateRecipeCookingMethods(
				testSectionId,
				[
					{ name: 'Standard', order: 1 },
					{ name: 'Grilling', order: 2 },
				],
				testUserId,
				logger,
			);

			expect(result[0].id).not.toBe(result[1].id);
		});

		it('updates existing methods when id is provided', async () => {
			const initial = await updateRecipeCookingMethods(testSectionId, [{ name: 'Standard', order: 1 }], testUserId, logger);
			const methodId = initial[0].id;

			const result = await updateRecipeCookingMethods(
				testSectionId,
				[{ id: methodId, name: 'Baking', order: 1 }],
				testUserId,
				logger,
			);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(methodId);
			expect(result[0].name).toBe('Baking');
		});

		it('sets updatedBy on updated methods', async () => {
			const initial = await updateRecipeCookingMethods(testSectionId, [{ name: 'Standard', order: 1 }], testUserId, logger);

			const result = await updateRecipeCookingMethods(
				testSectionId,
				[{ id: initial[0].id, name: 'Updated', order: 1 }],
				testUserId,
				logger,
			);

			expect(result[0].updatedBy).toBe(testUserId);
		});

		it('deletes methods not present in the new list', async () => {
			const initial = await updateRecipeCookingMethods(
				testSectionId,
				[
					{ name: 'Keep', order: 1 },
					{ name: 'Remove', order: 2 },
				],
				testUserId,
				logger,
			);

			const keepId = initial[0].id;

			await updateRecipeCookingMethods(testSectionId, [{ id: keepId, name: 'Keep', order: 1 }], testUserId, logger);

			const remaining = await updateRecipeCookingMethods(
				testSectionId,
				[{ id: keepId, name: 'Keep', order: 1 }],
				testUserId,
				logger,
			);
			expect(remaining).toHaveLength(1);
			expect(remaining[0].id).toBe(keepId);
		});

		it('handles mixed insert, update, and delete', async () => {
			const initial = await updateRecipeCookingMethods(
				testSectionId,
				[
					{ name: 'Keep and Update', order: 1 },
					{ name: 'Delete Me', order: 2 },
				],
				testUserId,
				logger,
			);

			const keepId = initial[0].id;

			const result = await updateRecipeCookingMethods(
				testSectionId,
				[
					{ id: keepId, name: 'Now Updated', order: 1 },
					{ name: 'Brand New', order: 2 },
				],
				testUserId,
				logger,
			);

			expect(result).toHaveLength(2);
			const names = result.map(m => m.name);
			expect(names).toContain('Now Updated');
			expect(names).toContain('Brand New');
		});

		it('does not affect methods of other sections', async () => {
			const recipe = await createRecipe({ authorId: testUserId, title: 'Other Recipe' }, testUserId, logger);
			const [otherSection] = await updateRecipeSections(recipe.id, [{ title: 'Other', order: 1 }], testUserId, logger);
			await updateRecipeCookingMethods(otherSection.id, [{ name: 'Other Method', order: 1 }], testUserId, logger);

			await updateRecipeCookingMethods(testSectionId, [{ name: 'My Method', order: 1 }], testUserId, logger);

			const otherMethods = await updateRecipeCookingMethods(
				otherSection.id,
				[{ name: 'Other Method', order: 1 }],
				testUserId,
				logger,
			);
			expect(otherMethods).toHaveLength(1);
			expect(otherMethods[0].recipeSectionId).toBe(otherSection.id);
		});
	});
});
