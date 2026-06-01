import { RzStepError } from '@/classes';
import type RzLogger from '@/logger';
import { updateRecipeInstructions } from '@/repositories';
import type { RecipeInstructionDBRead, RecipeSectionInstructionsInput } from '@/types';

export async function saveRecipeInstructions(
	recipeId: string,
	instructionsData: RecipeSectionInstructionsInput[],
	userId: string,
	logger: RzLogger,
): Promise<Record<string, RecipeInstructionDBRead[]>> {
	const savedInstructions: Record<string, RecipeInstructionDBRead[]> = {};
	for (const section of instructionsData) {
		try {
			savedInstructions[section.sectionId] = await updateRecipeInstructions(
				section.sectionId,
				section.instructions,
				userId,
				logger,
			);
			logger.info(`Saved instructions for recipe ${recipeId} section ${section.sectionId}`);
		} catch (error) {
			logger.warn(`Error saving instructions for recipe ${recipeId} section ${section.sectionId}: ${error}`);
			throw new RzStepError(
				400,
				'Failed to save recipe instructions',
				`Error saving instructions for recipe ${recipeId} section ${section.sectionId}: ${error}`,
			);
		}
	}
	return savedInstructions;
}
