import { RzStepError } from '@/classes';
import type RzLogger from '@/logger';
import { updateRecipeInstructions } from '@/repositories';
import type { IncomingInstructionsData, RecipeInstructionDBRead, RecipeInstructionFormSave } from '@/types';

export async function saveRecipeInstructions(
	recipeId: string,
	instructionsData: IncomingInstructionsData[] | undefined,
	userId: string,
	logger: RzLogger,
): Promise<Record<string, RecipeInstructionDBRead[]>> {
	if (!instructionsData) {
		return {};
	}
	const savedInstructions: Record<string, RecipeInstructionDBRead[]> = {};
	for (const section of instructionsData) {
		try {
			savedInstructions[section.sectionId] = await updateRecipeInstructions(
				section.sectionId,
				section.instructions as RecipeInstructionFormSave[],
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
