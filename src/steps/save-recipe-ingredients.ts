import { env } from 'cloudflare:workers';
import { RzStepError } from '@/classes';
import type RzLogger from '@/logger';
import { updateRecipeIngredients } from '@/repositories/recipe-ingredients';
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
			);
			logger.info(`Recipe ingredients saved for recipe ${recipeId} section ${section.sectionId}`);
		} catch (error) {
			logger.info(`Error saving section ingredients: ${error} `);

			const errorMessage =
				env.REZEPT_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to save item';

			throw new RzStepError(400, errorMessage);
		}
	}
	return savedIngredients;
}
