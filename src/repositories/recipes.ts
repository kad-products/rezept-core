import { eq, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import type RzLogger from '@/logger';
import { recipes } from '@/models';
import type { RecipeDBRead, RecipeWriteInput } from '@/types';
import { validateUuid } from './utils';

export async function getRecipes(logger: RzLogger): Promise<RecipeDBRead[]> {
	logger.debug('Fetching all recipes');
	const allRecipes = await db.select().from(recipes);
	logger.debug(`Fetched ${allRecipes.length} recipes`);
	return allRecipes;
}

export async function getRecipeById(recipeId: string, logger: RzLogger): Promise<RecipeDBRead> {
	if (!validateUuid(recipeId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [recipeId, 'Recipe']);
	}

	logger.debug(`Fetching recipe ${recipeId}`);
	const matchedRecipes = await db.select().from(recipes).where(eq(recipes.id, recipeId));

	if (matchedRecipes.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [matchedRecipes.length, 1, 'Recipe']);
	}

	return matchedRecipes[0];
}

export async function createRecipe(recipe: RecipeWriteInput, actingUserId: string, logger: RzLogger): Promise<RecipeDBRead> {
	logger.debug('Creating recipe');

	const insertedRecipes = await db
		.insert(recipes)
		.values({
			...recipe,
			createdBy: actingUserId,
		})
		.returning();

	const result = insertedRecipes[0];
	logger.info(`Created recipe ${result.id}`);
	return result;
}

export async function deleteRecipe(recipeId: string, actingUserId: string, logger: RzLogger): Promise<void> {
	if (!validateUuid(recipeId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [recipeId, 'Recipe']);
	}

	logger.debug(`Deleting recipe ${recipeId}`);
	const deleted = await db
		.update(recipes)
		.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: actingUserId })
		.where(eq(recipes.id, recipeId))
		.returning();

	if (deleted.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [deleted.length, 1, 'Recipe']);
	}

	logger.info(`Deleted recipe ${recipeId}`);
}

export async function updateRecipe(
	recipeId: string,
	recipeData: RecipeWriteInput,
	actingUserId: string,
	logger: RzLogger,
): Promise<RecipeDBRead> {
	logger.debug(`Updating recipe ${recipeId}`);

	const updatedRecipes = await db
		.update(recipes)
		.set({
			...recipeData,
			updatedAt: sql`(datetime('now', 'localtime'))`,
			updatedBy: actingUserId,
		})
		.where(eq(recipes.id, recipeId))
		.returning();

	const result = updatedRecipes[0];
	logger.info(`Updated recipe ${result.id}`);
	return result;
}
