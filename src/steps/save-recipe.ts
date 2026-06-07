import { RzStepError } from '@/classes';
import { createRecipe, updateRecipe } from '@/repositories';
import type { RecipeDBRead, RecipeWriteInput, RzLogger } from '@/types';

export async function saveRecipe(recipeData: RecipeWriteInput, userId: string, logger: RzLogger): Promise<RecipeDBRead> {
	let recipe: RecipeDBRead;
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
