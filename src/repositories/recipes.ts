import { eq } from 'drizzle-orm';
import db from '@/db';
import { recipes } from '@/models';
import type { Recipe, RecipeFormSave } from '@/types';

export async function getRecipes(): Promise<Recipe[]> {
	const allRecipes = await db.select().from(recipes);
	return allRecipes;
}

export async function getRecipeById(recipeId: string): Promise<Recipe> {
	const matchedRecipes = await db.select().from(recipes).where(eq(recipes.id, recipeId));

	if (matchedRecipes.length !== 1) {
		throw new Error(`getRecipeById: matchedRecipes length is ${matchedRecipes.length} for id ${recipeId}`);
	}

	return matchedRecipes[0];
}

export async function createRecipe(recipe: RecipeFormSave, userId: string) {
	console.log(`Form data in createRecipe: ${JSON.stringify(recipe, null, 4)} `);

	const insertedRecipes = await db
		.insert(recipes)
		.values({
			...recipe,
			createdBy: userId,
		})
		.returning();

	return insertedRecipes[0];
}

export async function updateRecipe(recipeId: string, recipeData: RecipeFormSave, userId: string) {
	console.log(`Form data in updateRecipe: ${JSON.stringify(recipeData, null, 4)} `);

	const updatedRecipes = await db
		.update(recipes)
		.set({
			...recipeData,
			updatedBy: userId,
		})
		.where(eq(recipes.id, recipeId))
		.returning();

	return updatedRecipes[0];
}
