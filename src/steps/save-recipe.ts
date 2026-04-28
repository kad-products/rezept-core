import { env } from 'cloudflare:workers';
import { RzStepError } from '@/classes';
import type RzLogger from '@/logger';
import { createRecipe, updateRecipe } from '@/repositories/recipes';
import type { Recipe, RecipeFormSave } from '@/types';

export async function saveRecipe(recipeData: RecipeFormSave, userId: string, logger: RzLogger): Promise<Recipe> {
	let recipe: Recipe;
	try {
		if (recipeData.id) {
			recipe = await updateRecipe(recipeData.id, recipeData, userId);
		} else {
			recipe = await createRecipe(recipeData, userId);
		}
		logger.info(`Recipe ${recipe.id} saved`);
	} catch (error) {
		logger.info(`Error saving recipe: ${error} `);

		const errorMessage =
			env.REZEPT_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to save item';

		throw new RzStepError(400, errorMessage);
	}
	return recipe;
}
