import { eq } from 'drizzle-orm';
import db from '@/db';
import type RzLogger from '@/logger';
import { recipes } from '@/models';
import type { Recipe, RecipeFormSave } from '@/types';
import { validateUuid } from './utils';

export async function getRecipes(logger: RzLogger): Promise<Recipe[]> {
	logger.debug('Fetching all recipes');
	const allRecipes = await db.select().from(recipes);
	logger.debug(`Fetched ${allRecipes.length} recipes`);
	return allRecipes;
}

export async function getRecipeById(recipeId: string, logger: RzLogger): Promise<Recipe> {
	if (!validateUuid(recipeId)) {
		throw new Error(`Invalid id: ${recipeId}`);
	}

	logger.debug(`Fetching recipe ${recipeId}`);
	const matchedRecipes = await db.select().from(recipes).where(eq(recipes.id, recipeId));

	if (matchedRecipes.length !== 1) {
		throw new Error(`getRecipeById: matchedRecipes length is ${matchedRecipes.length} for id ${recipeId}`);
	}

	return matchedRecipes[0];
}

export async function createRecipe(recipe: RecipeFormSave, userId: string, logger: RzLogger): Promise<Recipe> {
	logger.debug('Creating recipe');

	const insertedRecipes = await db
		.insert(recipes)
		.values({
			...recipe,
			createdBy: userId,
		})
		.returning();

	const result = insertedRecipes[0];
	logger.info(`Created recipe ${result.id}`);
	return result;
}

export async function updateRecipe(
	recipeId: string,
	recipeData: RecipeFormSave,
	userId: string,
	logger: RzLogger,
): Promise<Recipe> {
	logger.debug(`Updating recipe ${recipeId}`);

	const updatedRecipes = await db
		.update(recipes)
		.set({
			...recipeData,
			updatedBy: userId,
		})
		.where(eq(recipes.id, recipeId))
		.returning();

	const result = updatedRecipes[0];
	logger.info(`Updated recipe ${result.id}`);
	return result;
}
