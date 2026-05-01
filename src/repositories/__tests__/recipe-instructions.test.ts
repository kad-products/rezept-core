import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { getInstructionsByRecipeSectionId, updateRecipeInstructions } from '../recipe-instructions';
import { updateRecipeSections } from '../recipe-sections';
import { createRecipe } from '../recipes';

const logger = new Logger();

describe('recipe-instructions repository', () => {
	let testUserId: string;
	let testSectionId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', logger);
		testUserId = user.id;
		const recipe = await createRecipe({ authorId: testUserId, title: 'Test Recipe' }, testUserId, logger);
		const [section] = await updateRecipeSections(recipe.id, [{ title: 'Main', order: 1 }], testUserId, logger);
		testSectionId = section.id;
	});

	describe('getInstructionsByRecipeSectionId', () => {
		it('returns empty array when section has no instructions', async () => {
			const result = await getInstructionsByRecipeSectionId(testSectionId, logger);
			expect(result).toEqual([]);
		});

		it('returns all instructions for section', async () => {
			await updateRecipeInstructions(
				testSectionId,
				[
					{ stepNumber: 1, instruction: 'Preheat oven' },
					{ stepNumber: 2, instruction: 'Mix ingredients' },
				],
				testUserId,
				logger,
			);

			const result = await getInstructionsByRecipeSectionId(testSectionId, logger);
			expect(result).toHaveLength(2);
		});

		it('returns instructions sorted by stepNumber', async () => {
			await updateRecipeInstructions(
				testSectionId,
				[
					{ stepNumber: 3, instruction: 'Third step' },
					{ stepNumber: 1, instruction: 'First step' },
					{ stepNumber: 2, instruction: 'Second step' },
				],
				testUserId,
				logger,
			);

			const result = await getInstructionsByRecipeSectionId(testSectionId, logger);
			expect(result[0].stepNumber).toBe(1);
			expect(result[1].stepNumber).toBe(2);
			expect(result[2].stepNumber).toBe(3);
		});

		it('returns only instructions for the specified section', async () => {
			const recipe = await createRecipe({ authorId: testUserId, title: 'Other Recipe' }, testUserId, logger);
			const [otherSection] = await updateRecipeSections(recipe.id, [{ title: 'Other', order: 1 }], testUserId, logger);

			await updateRecipeInstructions(testSectionId, [{ stepNumber: 1, instruction: 'Mine' }], testUserId, logger);
			await updateRecipeInstructions(otherSection.id, [{ stepNumber: 1, instruction: 'Theirs' }], testUserId, logger);

			const result = await getInstructionsByRecipeSectionId(testSectionId, logger);
			expect(result).toHaveLength(1);
			expect(result[0].instruction).toBe('Mine');
		});
	});

	describe('updateRecipeInstructions', () => {
		it('inserts new instructions when none exist', async () => {
			const result = await updateRecipeInstructions(
				testSectionId,
				[
					{ stepNumber: 1, instruction: 'Preheat oven to 350°F' },
					{ stepNumber: 2, instruction: 'Mix dry ingredients' },
				],
				testUserId,
				logger,
			);

			expect(result).toHaveLength(2);
		});

		it('sets recipeSectionId and createdBy on new instructions', async () => {
			const result = await updateRecipeInstructions(
				testSectionId,
				[{ stepNumber: 1, instruction: 'First step' }],
				testUserId,
				logger,
			);

			expect(result[0].recipeSectionId).toBe(testSectionId);
			expect(result[0].createdBy).toBe(testUserId);
		});

		it('assigns unique ids to new instructions', async () => {
			const result = await updateRecipeInstructions(
				testSectionId,
				[
					{ stepNumber: 1, instruction: 'Step 1' },
					{ stepNumber: 2, instruction: 'Step 2' },
				],
				testUserId,
				logger,
			);

			expect(result[0].id).not.toBe(result[1].id);
		});

		it('updates existing instructions when id is provided', async () => {
			const initial = await updateRecipeInstructions(
				testSectionId,
				[{ stepNumber: 1, instruction: 'Original' }],
				testUserId,
				logger,
			);
			const instructionId = initial[0].id;

			const result = await updateRecipeInstructions(
				testSectionId,
				[{ id: instructionId, stepNumber: 1, instruction: 'Updated' }],
				testUserId,
				logger,
			);

			expect(result).toHaveLength(1);
			expect(result[0].id).toBe(instructionId);
			expect(result[0].instruction).toBe('Updated');
		});

		it('sets updatedBy on updated instructions', async () => {
			const initial = await updateRecipeInstructions(
				testSectionId,
				[{ stepNumber: 1, instruction: 'Original' }],
				testUserId,
				logger,
			);

			const result = await updateRecipeInstructions(
				testSectionId,
				[{ id: initial[0].id, stepNumber: 1, instruction: 'Updated' }],
				testUserId,
				logger,
			);

			expect(result[0].updatedBy).toBe(testUserId);
		});

		it('deletes instructions not present in the new list', async () => {
			const initial = await updateRecipeInstructions(
				testSectionId,
				[
					{ stepNumber: 1, instruction: 'Keep' },
					{ stepNumber: 2, instruction: 'Remove' },
				],
				testUserId,
				logger,
			);

			const keepId = initial[0].id;

			await updateRecipeInstructions(testSectionId, [{ id: keepId, stepNumber: 1, instruction: 'Keep' }], testUserId, logger);

			const remaining = await getInstructionsByRecipeSectionId(testSectionId, logger);
			expect(remaining).toHaveLength(1);
			expect(remaining[0].id).toBe(keepId);
		});

		it('handles mixed insert, update, and delete', async () => {
			const initial = await updateRecipeInstructions(
				testSectionId,
				[
					{ stepNumber: 1, instruction: 'Keep and Update' },
					{ stepNumber: 2, instruction: 'Delete Me' },
				],
				testUserId,
				logger,
			);

			const keepId = initial[0].id;

			await updateRecipeInstructions(
				testSectionId,
				[
					{ id: keepId, stepNumber: 1, instruction: 'Now Updated' },
					{ stepNumber: 2, instruction: 'Brand New' },
				],
				testUserId,
				logger,
			);

			const all = await getInstructionsByRecipeSectionId(testSectionId, logger);
			expect(all).toHaveLength(2);

			const instructions = all.map(i => i.instruction);
			expect(instructions).toContain('Now Updated');
			expect(instructions).toContain('Brand New');
		});

		it('does not affect instructions in other sections', async () => {
			const recipe = await createRecipe({ authorId: testUserId, title: 'Other Recipe' }, testUserId, logger);
			const [otherSection] = await updateRecipeSections(recipe.id, [{ title: 'Other', order: 1 }], testUserId, logger);
			await updateRecipeInstructions(otherSection.id, [{ stepNumber: 1, instruction: 'Other step' }], testUserId, logger);

			await updateRecipeInstructions(testSectionId, [{ stepNumber: 1, instruction: 'My step' }], testUserId, logger);

			const otherInstructions = await getInstructionsByRecipeSectionId(otherSection.id, logger);
			expect(otherInstructions).toHaveLength(1);
			expect(otherInstructions[0].instruction).toBe('Other step');
		});
	});
});
