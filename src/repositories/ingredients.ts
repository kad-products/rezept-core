import { eq, inArray, isNull, sql } from 'drizzle-orm';
import db from '@/db';
import { ingredients } from '@/models';
import type { IngredientDBRead, IngredientFormInput, RzLogger } from '@/types';

export async function getIngredients(logger: RzLogger): Promise<IngredientDBRead[]> {
	logger.debug('Fetching all ingredients');
	const ingredientsList = await db.select().from(ingredients).where(isNull(ingredients.deletedAt));
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

export async function saveIngredients(
	pendingIngredients: string[],
	userId: string,
	logger: RzLogger,
): Promise<IngredientDBRead[]> {
	logger.debug(`Saving ${pendingIngredients.length} ingredients`);

	const existingIngredients = await db.select().from(ingredients).where(inArray(ingredients.name, pendingIngredients));

	const savedIngredients = await Promise.all(
		pendingIngredients.map(async ing => {
			const matchingIngredient = existingIngredients.find(existing => existing.name === ing);
			if (matchingIngredient) {
				const [updatedIngredient] = await db
					.update(ingredients)
					.set({
						name: ing,
						updatedAt: sql`(datetime('now', 'localtime'))`,
						updatedBy: userId,
					})
					.where(eq(ingredients.id, matchingIngredient.id))
					.returning();

				logger.info(`Updated ingredient ${updatedIngredient.id}`);
				return updatedIngredient;
			} else {
				const [newIngredient] = await db
					.insert(ingredients)
					.values({
						name: ing,
						createdBy: userId,
					})
					.returning();

				logger.info(`Created ingredient ${newIngredient.id} for string ${ing}`);
				return newIngredient;
			}
		}),
	);

	logger.info(`Saved ${savedIngredients.length} ingredients`);

	return savedIngredients;
}
