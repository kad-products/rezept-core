import { RzStepError } from '@/classes';
import { updateRecipeInstructions } from '@/repositories';
import type { RecipeCookingMethodInstructionsInput, RecipeInstructionDBRead, RzLogger } from '@/types';

export async function saveRecipeInstructions(
	recipeId: string,
	instructionsData: RecipeCookingMethodInstructionsInput[],
	userId: string,
	logger: RzLogger,
): Promise<Record<string, RecipeInstructionDBRead[]>> {
	const savedInstructions: Record<string, RecipeInstructionDBRead[]> = {};
	for (const entry of instructionsData) {
		try {
			savedInstructions[entry.cookingMethodId] = await updateRecipeInstructions(
				entry.cookingMethodId,
				entry.instructions,
				userId,
				logger,
			);
			logger.info(`Saved instructions for recipe ${recipeId} cooking method ${entry.cookingMethodId}`);
		} catch (error) {
			logger.warn(`Error saving instructions for recipe ${recipeId} cooking method ${entry.cookingMethodId}: ${error}`);
			throw new RzStepError(
				400,
				'Failed to save recipe instructions',
				`Error saving instructions for recipe ${recipeId} cooking method ${entry.cookingMethodId}: ${error}`,
			);
		}
	}
	return savedInstructions;
}
