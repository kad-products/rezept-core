import { eq } from 'drizzle-orm';
import db from '@/db';
import { type Recipe, recipes } from '@/models/schema';

export async function getRecipes(): Promise<Recipe[]> {
	const allRecipes = await db.select().from(recipes);
	return allRecipes;
}

export async function getRecipeById(recipeId: string): Promise<Recipe | undefined> {
	const matchedRecipes = await db.select().from(recipes).where(eq(recipes.id, recipeId));

	if (matchedRecipes.length > 1) {
		throw new Error(
			`getRecipeById: matchedRecipes length is ${matchedRecipes.length} for id ${recipeId}`,
		);
	}

	if (matchedRecipes.length === 0) {
		return undefined;
	}

	return matchedRecipes[0];
}
