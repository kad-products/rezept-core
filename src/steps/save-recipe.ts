import { RzStepError } from '@/classes';
import type RzLogger from '@/logger';
import { createRecipe, updateRecipe } from '@/repositories';
import type { Recipe, RecipeFormSave } from '@/types';

export async function saveRecipe(recipeData: RecipeFormSave, userId: string, logger: RzLogger): Promise<Recipe> {
	let recipe: Recipe;
	try {
		if (recipeData.id) {
			recipe = await updateRecipe(recipeData.id, recipeData, userId, logger);
		} else {
			recipe = await createRecipe(recipeData, userId, logger);
		}
		logger.info(`Recipe ${recipe.id} saved`);
	} catch (error) {
		logger.warn(`Error saving recipe: ${error}`);
		throw new RzStepError(400, 'Failed to save recipe', `Error saving recipe: ${error}`);
	}
	return recipe;
}
