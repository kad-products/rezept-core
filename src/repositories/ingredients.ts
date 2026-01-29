import db from '@/db';
import { type Ingredient, ingredients } from '@/models/ingredients';

export async function getIngredients(): Promise<Ingredient[]> {
	const ingredientsList = await db.select().from(ingredients);
	return ingredientsList;
}
