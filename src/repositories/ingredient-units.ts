import db from '@/db';
import type RzLogger from '@/logger';
import { ingredientUnits } from '@/models';
import type { IngredientUnit } from '@/types';

export async function getUnits(logger: RzLogger): Promise<IngredientUnit[]> {
	logger.debug('Fetching all ingredient units');
	const units = await db.select().from(ingredientUnits);
	logger.debug(`Fetched ${units.length} ingredient units`);
	return units;
}
