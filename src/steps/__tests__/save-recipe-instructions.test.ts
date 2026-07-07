import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RzStepError } from '@/classes';
import { createNoopLogger } from '@/logger';
import { saveRecipeInstructions } from '@/steps';
import type { RecipeCookingMethodInstructionsInput, RecipeInstructionDBRead } from '@/types';

vi.mock('@/repositories', () => ({
	updateRecipeInstructions: vi.fn(),
}));

import { updateRecipeInstructions } from '@/repositories';

const logger = createNoopLogger();
const recipeId = 'recipe-123';
const userId = '00000000-0000-0000-0000-000000000001';
const cookingMethodId = '00000000-0000-0000-0000-000000000002';
const mockInstructions = [
	{ id: 'instr-1', recipeCookingMethodId: cookingMethodId, stepNumber: 1, instruction: 'Mix well' },
] as unknown as RecipeInstructionDBRead[];

describe('saveRecipeInstructions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('saves instructions for a single cooking method and keys the result by cookingMethodId', async () => {
		vi.mocked(updateRecipeInstructions).mockResolvedValue(mockInstructions);
		const instructionsData: RecipeCookingMethodInstructionsInput[] = [{ cookingMethodId, instructions: [] }];

		const result = await saveRecipeInstructions(recipeId, instructionsData, userId, logger);

		expect(updateRecipeInstructions).toHaveBeenCalledWith(cookingMethodId, [], userId, logger);
		expect(result).toEqual({ [cookingMethodId]: mockInstructions });
	});

	it('saves instructions for multiple cooking methods', async () => {
		const cookingMethodId2 = '00000000-0000-0000-0000-000000000003';
		vi.mocked(updateRecipeInstructions).mockResolvedValue(mockInstructions);
		const instructionsData: RecipeCookingMethodInstructionsInput[] = [
			{ cookingMethodId, instructions: [] },
			{ cookingMethodId: cookingMethodId2, instructions: [] },
		];

		const result = await saveRecipeInstructions(recipeId, instructionsData, userId, logger);

		expect(updateRecipeInstructions).toHaveBeenCalledTimes(2);
		expect(result).toHaveProperty(cookingMethodId);
		expect(result).toHaveProperty(cookingMethodId2);
	});

	it('throws RzStepError 400 when updateRecipeInstructions fails', async () => {
		vi.mocked(updateRecipeInstructions).mockRejectedValue(new Error('DB connection error'));
		const instructionsData: RecipeCookingMethodInstructionsInput[] = [{ cookingMethodId, instructions: [] }];

		await expect(saveRecipeInstructions(recipeId, instructionsData, userId, logger)).rejects.toThrow(RzStepError);
		await expect(saveRecipeInstructions(recipeId, instructionsData, userId, logger)).rejects.toMatchObject({ code: 400 });
	});
});
