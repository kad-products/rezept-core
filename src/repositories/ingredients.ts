import db from '@/db';
import { type Ingredient, type IngredientFormSave, ingredients } from '@/models/ingredients';

export async function getIngredients(): Promise<Ingredient[]> {
	const ingredientsList = await db.select().from(ingredients);
	return ingredientsList;
}

export async function createIngredient(ingredient: IngredientFormSave, userId: string): Promise<Ingredient> {
	const [newIngredient] = await db
		.insert(ingredients)
		.values({ ...ingredient, createdBy: userId })
		.returning();

	return newIngredient;
}
