import { and, eq, isNull, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import { recipeIngredients } from '@/models';
import type { RecipeIngredientDBRead, RecipeIngredientWriteInput, RzLogger } from '@/types';
import { validateUuid } from './utils';

export async function getRecipeIngredientsByRecipeSectionId(
	recipeSectionId: string,
	logger: RzLogger,
): Promise<RecipeIngredientDBRead[]> {
	logger.debug(`Fetching all recipe ingredients for section ${recipeSectionId}`);

	const results = await db
		.select()
		.from(recipeIngredients)
		.where(and(eq(recipeIngredients.recipeSectionId, recipeSectionId), isNull(recipeIngredients.deletedAt)));
	logger.debug(`Fetched ${results.length} recipe ingredients`);
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
		.where(and(eq(recipeIngredients.recipeSectionId, recipeSectionId), isNull(recipeIngredients.deletedAt)));

	// remove ones that are not present in ingredientsData
	const removedIngredientIds = existingIngredients.map(i => i.id).filter(id => !ingredientsData.some(idData => idData.id === id));

	await Promise.all(
		removedIngredientIds.map(id =>
			db
				.update(recipeIngredients)
				.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: userId })
				.where(eq(recipeIngredients.id, id)),
		),
	);

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

export async function updateRecipeIngredient(
	recipeIngredientId: string,
	recipeIngredient: Partial<RecipeIngredientWriteInput>,
	userId: string,
	logger: RzLogger,
): Promise<RecipeIngredientDBRead> {
	if (!validateUuid(recipeIngredientId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [recipeIngredientId, 'Recipe Ingredient']);
	}
	logger.debug(`Updating recipe ingredient ${recipeIngredientId}`);
	const [updatedRecipeIngredient] = await db
		.update(recipeIngredients)
		.set({
			...recipeIngredient,
			updatedAt: sql`(datetime('now', 'localtime'))`,
			updatedBy: userId,
		})
		.where(eq(recipeIngredients.id, recipeIngredientId))
		.returning();
	if (!updatedRecipeIngredient) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [0, 1, 'Recipe Ingredient']);
	}

	logger.info(`Updated ingredient ${recipeIngredientId}`);

	return updatedRecipeIngredient;
}
