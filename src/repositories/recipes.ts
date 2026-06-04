import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import type RzLogger from '@/logger';
import { recipeIngredients, recipeInstructions, recipeSections, recipes } from '@/models';
import type { RecipeDBRead, RecipeWithSections, RecipeWriteInput } from '@/types';
import { validateUuid } from './utils';

export async function getRecipes(logger: RzLogger): Promise<RecipeDBRead[]> {
	logger.debug('Fetching all recipes');
	const allRecipes = await db.select().from(recipes).where(isNull(recipes.deletedAt));
	logger.debug(`Fetched ${allRecipes.length} recipes`);
	return allRecipes;
}

export async function getRecipeById(recipeId: string, logger: RzLogger): Promise<RecipeWithSections> {
	if (!validateUuid(recipeId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [recipeId, 'Recipe']);
	}

	logger.debug(`Fetching recipe ${recipeId}`);
	const recipe = await db.query.recipes.findFirst({
		where: and(eq(recipes.id, recipeId), isNull(recipes.deletedAt)),
		with: {
			author: true,
			sections: {
				where: isNull(recipeSections.deletedAt),
				orderBy: [asc(recipeSections.order)],
				with: {
					ingredients: {
						where: isNull(recipeIngredients.deletedAt),
						orderBy: [asc(recipeIngredients.order)],
						with: {
							unit: true,
						},
					},
					instructions: {
						where: isNull(recipeInstructions.deletedAt),
						orderBy: [asc(recipeInstructions.stepNumber)],
					},
				},
			},
		},
	});

	if (!recipe) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [0, 1, 'Recipe']);
	}

	logger.debug(`Fetched recipe ${recipeId}`);
	return recipe;
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

export async function deleteRecipe(recipeId: string, actingUserId: string, logger: RzLogger): Promise<RecipeDBRead> {
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
	return deleted[0];
}

export async function updateRecipeCoverImage(
	recipeId: string,
	coverImageId: string,
	actingUserId: string,
	logger: RzLogger,
): Promise<RecipeDBRead> {
	if (!validateUuid(recipeId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [recipeId, 'Recipe']);
	}

	logger.debug(`Setting cover image for recipe ${recipeId}`);

	const updated = await db
		.update(recipes)
		.set({
			coverImageId,
			updatedAt: sql`(datetime('now', 'localtime'))`,
			updatedBy: actingUserId,
		})
		.where(eq(recipes.id, recipeId))
		.returning();

	if (updated.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [updated.length, 1, 'Recipe']);
	}

	logger.info(`Set cover image ${coverImageId} on recipe ${recipeId}`);
	return updated[0];
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

	if (updatedRecipes.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [updatedRecipes.length, 1, 'Recipe']);
	}

	const result = updatedRecipes[0];
	logger.info(`Updated recipe ${result.id}`);
	return result;
}
