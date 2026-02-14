import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import db from '@/db';
import { recipes } from '@/models/schema';
import type { Recipe, RecipeFormSave } from '@/types';

export async function getRecipes(): Promise<Recipe[]> {
	const allRecipes = await db.select().from(recipes);
	return allRecipes;
}

export async function getRecipeById(recipeId: string): Promise<Recipe | undefined> {
	const matchedRecipes = await db.select().from(recipes).where(eq(recipes.id, recipeId));

	if (matchedRecipes.length > 1) {
		throw new Error(`getRecipeById: matchedRecipes length is ${matchedRecipes.length} for id ${recipeId}`);
	}

	if (matchedRecipes.length === 0) {
		return undefined;
	}

	return matchedRecipes[0];
}

export const createRecipeFormValidationSchema = createInsertSchema(recipes, {
	id: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	servings: z.coerce.number().min(1, { message: 'Servings must be at least 1' }).default(1),
	cookTime: z.coerce.number().min(0, { message: 'Cook time cannot be negative' }).default(0),
	prepTime: z.coerce.number().min(0, { message: 'Prep time cannot be negative' }).default(0),
}).omit({
	createdAt: true,
	createdBy: true,
	updatedAt: true,
	updatedBy: true,
	deletedAt: true,
	deletedBy: true,
});

export async function createRecipe(recipe: RecipeFormSave, userId: string) {
	console.log(`Form data in createRecipe: ${JSON.stringify(recipe, null, 4)} `);

	return await db
		.insert(recipes)
		.values({
			...recipe,
			createdBy: userId,
		})
		.returning();
}

export async function updateRecipe(recipeId: string, recipeData: RecipeFormSave, userId: string) {
	console.log(`Form data in updateRecipe: ${JSON.stringify(recipeData, null, 4)} `);

	return await db
		.update(recipes)
		.set({
			...recipeData,
			updatedBy: userId,
		})
		.where(eq(recipes.id, recipeId))
		.returning();
}
