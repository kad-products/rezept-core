import { and, eq, inArray } from 'drizzle-orm';
import db from '@/db';
import type RzLogger from '@/logger';
import { seasonalIngredients } from '@/models';
import type { SeasonalIngredientWithRelations } from '@/types';

// biome-ignore lint/nursery/useExplicitType: Drizzle query builder return type is not practically writable
const getSeasonalIngredientsQuery = (seasonId: string) =>
	db.query.seasonalIngredients.findMany({
		where: eq(seasonalIngredients.seasonId, seasonId),
		with: {
			ingredient: true,
		},
	});

export async function getIngredientsBySeasonId(seasonId: string, logger: RzLogger): Promise<SeasonalIngredientWithRelations[]> {
	logger.debug(`Fetching ingredients for season ${seasonId}`);
	const results = await getSeasonalIngredientsQuery(seasonId);
	logger.debug(`Fetched ${results.length} ingredients for season ${seasonId}`);
	return results;
}

export async function updateSeasonalIngredientsForSeason(
	seasonId: string,
	ingredientIds: string[],
	userId: string,
	logger: RzLogger,
): Promise<void> {
	// find existing ones
	const existingIngredientIds = await db
		.select({ ingredientId: seasonalIngredients.ingredientId })
		.from(seasonalIngredients)
		.where(eq(seasonalIngredients.seasonId, seasonId))
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

	// delete the existing ones not in the new list
	const removedIngredientIds = existingIngredientIds.filter(id => !ingredientIds.includes(id));
	await db
		.delete(seasonalIngredients)
		.where(and(inArray(seasonalIngredients.ingredientId, removedIngredientIds), eq(seasonalIngredients.seasonId, seasonId)));

	if (removedIngredientIds.length > 0) {
		logger.info(`Deleted ${removedIngredientIds.length} seasonal ingredients for season ${seasonId}`);
	}

	logger.info(`Updated seasonal ingredients for season ${seasonId}`);
}
