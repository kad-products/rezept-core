import db from '@/db';
import { type IngredientUnit, ingredientUnits } from '@/models/ingredient-units';

export async function getUnits(): Promise<IngredientUnit[]> {
	const units = await db.select().from(ingredientUnits);
	return units;
}
