import { isNull } from 'drizzle-orm';
import db from '@/db';
import type RzLogger from '@/logger';
import { ingredientUnits } from '@/models';
import type { IngredientUnitDBRead } from '@/types';

export async function getUnits(logger: RzLogger): Promise<IngredientUnitDBRead[]> {
	logger.debug('Fetching all ingredient units');
	const units = await db.select().from(ingredientUnits).where(isNull(ingredientUnits.deletedAt));
	logger.debug(`Fetched ${units.length} ingredient units`);
	return units;
}
