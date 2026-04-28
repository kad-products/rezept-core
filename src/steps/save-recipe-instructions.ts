import { env } from 'cloudflare:workers';
import { RzStepError } from '@/classes';
import type RzLogger from '@/logger';
import { updateRecipeInstructions } from '@/repositories/recipe-instructions';
import type { RecipeInstruction, RecipeInstructionFormSave } from '@/types';

type IncomingInstructionsData = {
	sectionId: string;
	instructions: RecipeInstructionFormSave[] | undefined;
};

export async function saveRecipeInstructions(
	recipeId: string,
	instructionsData: IncomingInstructionsData[] | undefined,
	userId: string,
	logger: RzLogger,
) {
	if (!instructionsData) {
		return [];
	}
	const savedInstructions: Record<string, RecipeInstruction[]> = {};
	for (const section of instructionsData) {
		try {
			savedInstructions[section.sectionId] = await updateRecipeInstructions(
				section.sectionId,
				section.instructions as RecipeInstructionFormSave[],
				userId,
			);
			logger.info(`Recipe instructions saved for recipe ${recipeId} section ${section.sectionId}`);
		} catch (error) {
			logger.info(`Error saving section instructions: ${error} `);

			const errorMessage =
				env.REZEPT_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to save item';

			throw new RzStepError(400, errorMessage);
		}
	}
	return savedInstructions;
}
