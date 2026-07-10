import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import { ingredients } from '@/models';
import type { IngredientDBRead, IngredientFormInput, IngredientWithSeasons, RzLogger } from '@/types';
import { validateUuid } from './utils';

export async function getIngredientById(ingredientId: string, logger: RzLogger): Promise<IngredientWithSeasons> {
	if (!validateUuid(ingredientId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [ingredientId, 'Ingredient']);
	}

	logger.debug(`Fetching ingredient ${ingredientId}`);
	const ingredient = await db.query.ingredients.findFirst({
		where: and(eq(ingredients.id, ingredientId), isNull(ingredients.deletedAt)),
		with: {
			seasons: true,
		},
	});

	if (!ingredient) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [0, 1, 'Ingredient']);
	}

	return ingredient;
}

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

export async function updateIngredient(
	ingredientId: string,
	ingredient: IngredientFormInput,
	userId: string,
	logger: RzLogger,
): Promise<IngredientDBRead> {
	if (!validateUuid(ingredientId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [ingredientId, 'Ingredient']);
	}

	logger.debug(`Updating ingredient ${ingredientId}`);
	const [updatedIngredient] = await db
		.update(ingredients)
		.set({ ...ingredient, updatedBy: userId, updatedAt: sql`(datetime('now', 'localtime'))` })
		.where(eq(ingredients.id, ingredientId))
		.returning();

	logger.info(`Updated ingredient ${updatedIngredient.id}`);
	return updatedIngredient;
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
