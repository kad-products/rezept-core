import db from '@/db';
import type RzLogger from '@/logger';
import { ingredients } from '@/models';
import type { IngredientDBRead, IngredientFormInput } from '@/types';

export async function getIngredients(logger: RzLogger): Promise<IngredientDBRead[]> {
	logger.debug('Fetching all ingredients');
	const ingredientsList = await db.select().from(ingredients);
	logger.debug(`Fetched ${ingredientsList.length} ingredients`);
	return ingredientsList;
}

export async function createIngredient(
	ingredient: IngredientFormInput,
	userId: string,
	logger: RzLogger,
): Promise<IngredientDBRead> {
	logger.debug(`Creating ingredient ${ingredient.name}`);
	const [newIngredient] = await db
		.insert(ingredients)
		.values({ ...ingredient, createdBy: userId })
		.returning();

	logger.info(`Created ingredient ${newIngredient.id}`);
	return newIngredient;
}
