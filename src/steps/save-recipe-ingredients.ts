import { RzStepError } from '@/classes';
import { updateRecipeIngredients } from '@/repositories';
import type { RecipeIngredientDBRead, RecipeSectionIngredientsInput, RzLogger } from '@/types';

export async function saveRecipeIngredients(
	recipeId: string,
	ingredientsData: RecipeSectionIngredientsInput[],
	userId: string,
	logger: RzLogger,
): Promise<Record<string, RecipeIngredientDBRead[]>> {
	const savedIngredients: Record<string, RecipeIngredientDBRead[]> = {};
	for (const section of ingredientsData) {
		try {
			savedIngredients[section.sectionId] = await updateRecipeIngredients(section.sectionId, section.ingredients, userId, logger);
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
