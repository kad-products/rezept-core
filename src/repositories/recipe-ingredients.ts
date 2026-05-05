import { eq, sql } from 'drizzle-orm';
import db from '@/db';
import type RzLogger from '@/logger';
import { recipeIngredients } from '@/models';
import type { RecipeIngredientDBRead, RecipeIngredientWriteInput } from '@/types';

export async function getIngredientsByRecipeSectionId(
	recipeSectionId: string,
	logger: RzLogger,
): Promise<RecipeIngredientDBRead[]> {
	logger.debug(`Fetching ingredients for section ${recipeSectionId}`);
	const results = await db.query.recipeIngredients.findMany({
		where: eq(recipeIngredients.recipeSectionId, recipeSectionId),
		with: {
			unit: true,
		},
	});
	logger.debug(`Fetched ${results.length} ingredients for section ${recipeSectionId}`);
	return results;
}

export async function updateRecipeIngredients(
	recipeSectionId: string,
	ingredientsData: RecipeIngredientWriteInput[],
	userId: string,
	logger: RzLogger,
): Promise<RecipeIngredientDBRead[]> {
	logger.debug(`Updating ingredients for section ${recipeSectionId}`);

	// get existing ingredients for the recipe
	const existingIngredients = await db
		.select()
		.from(recipeIngredients)
		.where(eq(recipeIngredients.recipeSectionId, recipeSectionId));

	// remove ones that are not present in ingredientsData
	const removedIngredientIds = existingIngredients.map(i => i.id).filter(id => !ingredientsData.some(idData => idData.id === id));

	await Promise.all(removedIngredientIds.map(id => db.delete(recipeIngredients).where(eq(recipeIngredients.id, id))));

	if (removedIngredientIds.length > 0) {
		logger.info(`Deleted ${removedIngredientIds.length} ingredients for section ${recipeSectionId}`);
	}

	// update or insert ingredients from ingredientsData
	const savedIngredients = await Promise.all(
		ingredientsData.map(async (ingData: RecipeIngredientWriteInput) => {
			if (ingData.id) {
				// update existing ingredients
				const [updatedIngredient] = await db
					.update(recipeIngredients)
					.set({
						ingredientId: ingData.ingredientId,
						quantity: ingData.quantity,
						unitId: ingData.unitId,
						preparation: ingData.preparation,
						modifier: ingData.modifier,
						order: ingData.order,
						raw: ingData.raw,
						updatedAt: sql`(datetime('now', 'localtime'))`,
						updatedBy: userId,
					})
					.where(eq(recipeIngredients.id, ingData.id))
					.returning();

				logger.info(`Updated ingredient ${ingData.id}`);

				return updatedIngredient;
			} else {
				// insert new ingredient
				const [newIngredient] = await db
					.insert(recipeIngredients)
					.values({
						recipeSectionId,
						ingredientId: ingData.ingredientId,
						quantity: ingData.quantity,
						unitId: ingData.unitId,
						preparation: ingData.preparation,
						modifier: ingData.modifier,
						order: ingData.order,
						raw: ingData.raw,
						createdBy: userId,
					})
					.returning();

				logger.info(`Created ingredient ${newIngredient.id} for section ${recipeSectionId}`);

				return newIngredient;
			}
		}),
	);

	logger.info(`Updated ${savedIngredients.length} ingredients for section ${recipeSectionId}`);

	return savedIngredients;
}
