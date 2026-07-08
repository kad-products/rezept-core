import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import { recipeCookingMethods, recipeIngredients, recipeInstructions, recipeSections, recipes } from '@/models';
import type { RecipeDBRead, RecipeFilters, RecipeWithSections, RecipeWriteInput, RzLogger } from '@/types';
import { validateUuid } from './utils';

export async function getRecipes(
	filters: RecipeFilters,
	limit: number,
	offset: number,
	logger: RzLogger,
): Promise<RecipeDBRead[]> {
	logger.debug('Fetching all recipes');
	const allRecipes = await db
		.select()
		.from(recipes)
		.where(
			and(
				and(
					filters.source ? eq(recipes.source, filters.source) : undefined,
					filters.id ? inArray(recipes.id, filters.id) : undefined,
				),
				isNull(recipes.deletedAt),
			),
		)
		.limit(limit)
		.offset(offset);
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
					cookingMethods: {
						where: isNull(recipeCookingMethods.deletedAt),
						orderBy: [asc(recipeCookingMethods.order)],
						with: {
							instructions: {
								where: isNull(recipeInstructions.deletedAt),
								orderBy: [asc(recipeInstructions.stepNumber)],
							},
						},
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

function normalizeSource(source: string | null | undefined): string | null | undefined {
	if (!source) return source;
	return source.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

export async function createRecipe(recipe: RecipeWriteInput, actingUserId: string, logger: RzLogger): Promise<RecipeDBRead> {
	logger.debug('Creating recipe');

	const insertedRecipes = await db
		.insert(recipes)
		.values({
			...recipe,
			source: normalizeSource(recipe.source),
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
			source: normalizeSource(recipeData.source),
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
