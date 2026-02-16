import db from '@/db';
import { ingredientUnits } from '@/models';
import type { IngredientUnit } from '@/types';

export async function getUnits(): Promise<IngredientUnit[]> {
	const units = await db.select().from(ingredientUnits);
	return units;
}
