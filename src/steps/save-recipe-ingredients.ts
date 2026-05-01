import { RzStepError } from '@/classes';
import type RzLogger from '@/logger';
import { updateRecipeIngredients } from '@/repositories';
import type { RecipeIngredient, RecipeIngredientFormSave } from '@/types';

type IncomingIngredientsData = {
	sectionId: string;
	ingredients: RecipeIngredientFormSave[] | undefined;
};

export async function saveRecipeIngredients(
	recipeId: string,
	ingredientsData: IncomingIngredientsData[] | undefined,
	userId: string,
	logger: RzLogger,
): Promise<Record<string, RecipeIngredient[]>> {
	if (!ingredientsData) {
		return {};
	}
	const savedIngredients: Record<string, RecipeIngredient[]> = {};
	for (const section of ingredientsData) {
		try {
			savedIngredients[section.sectionId] = await updateRecipeIngredients(
				section.sectionId,
				section.ingredients as RecipeIngredientFormSave[],
				userId,
				logger,
			);
			logger.info(`Saved ingredients for recipe ${recipeId} section ${section.sectionId}`);
		} catch (error) {
			logger.warn(`Error saving ingredients for recipe ${recipeId} section ${section.sectionId}: ${error}`);
			throw new RzStepError(
				400,
				'Failed to save recipe ingredients',
				`Error saving ingredients for recipe ${recipeId} section ${section.sectionId}: ${error}`,
			);
		}
	}
	return savedIngredients;
}
