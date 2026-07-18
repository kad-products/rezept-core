import { updateRecipeIngredient } from '@/repositories';
import type { IngredientDBRead, RecipeIngredientDBRead, RzLogger } from '@/types';
import { parseRawIngredient } from './parse-raw-ingredient';

export async function updateRecipeIngredientsWithIngredientIds(
	allRecipeIngredients: RecipeIngredientDBRead[],
	verifiedIngredients: IngredientDBRead[],
	userId: string,
	logger: RzLogger,
): Promise<RecipeIngredientDBRead[]> {
	// build a map of recipeIngredientId to ingredientId
	const ingredientsMap = new Map<string, string>();
	allRecipeIngredients.forEach(ri => {
		const matchingIngredient = verifiedIngredients.find(vi => vi.name === parseRawIngredient(ri.raw ?? '', logger));
		if (matchingIngredient) {
			ingredientsMap.set(ri.id, matchingIngredient.id);
		}
	});
	const updatedRecipeIngredients: RecipeIngredientDBRead[] = [];
	for (const [recipeIngredientId, ingredientId] of ingredientsMap) {
		logger.info(`Ingredient map has recipe ingredient ${recipeIngredientId} mapped to ingredient ${ingredientId}`);
		const updatedRecipeIngredient = await updateRecipeIngredient(recipeIngredientId, { ingredientId }, userId, logger);
		updatedRecipeIngredients.push(updatedRecipeIngredient);
	}
	return updatedRecipeIngredients;
}
