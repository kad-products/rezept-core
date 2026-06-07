import { and, eq, inArray, isNull, sql } from 'drizzle-orm';
import db from '@/db';
import { seasonalIngredients } from '@/models';
import type { RzLogger } from '@/types';

export async function updateSeasonalIngredientsForSeason(
	seasonId: string,
	ingredientIds: string[],
	userId: string,
	logger: RzLogger,
): Promise<void> {
	// find existing ones (excluding soft-deleted)
	const existingIngredientIds = await db
		.select({ ingredientId: seasonalIngredients.ingredientId })
		.from(seasonalIngredients)
		.where(and(eq(seasonalIngredients.seasonId, seasonId), isNull(seasonalIngredients.deletedAt)))
		.then(rows => rows.map(row => row.ingredientId));

	logger.debug(`Found ${existingIngredientIds.length} existing ingredients for season ${seasonId}`);

	// insert and ignore conflicts for new ones
	const insertValues = ingredientIds.map(ingredientId => ({
		seasonId,
		ingredientId,
		createdBy: userId,
	}));
	await db.insert(seasonalIngredients).values(insertValues).onConflictDoNothing();

	logger.info(`Upserted ${insertValues.length} seasonal ingredients for season ${seasonId}`);

	// soft-delete the existing ones not in the new list
	const removedIngredientIds = existingIngredientIds.filter(id => !ingredientIds.includes(id));
	if (removedIngredientIds.length > 0) {
		await db
			.update(seasonalIngredients)
			.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: userId })
			.where(and(inArray(seasonalIngredients.ingredientId, removedIngredientIds), eq(seasonalIngredients.seasonId, seasonId)));
		logger.info(`Deleted ${removedIngredientIds.length} seasonal ingredients for season ${seasonId}`);
	}

	logger.info(`Updated seasonal ingredients for season ${seasonId}`);
}
