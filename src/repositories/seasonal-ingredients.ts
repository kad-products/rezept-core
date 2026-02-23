import { and, eq, inArray } from 'drizzle-orm';
import { requestInfo } from 'rwsdk/worker';
import db from '@/db';
import { seasonalIngredients } from '@/models';

const getSeasonalIngredientsQuery = (seasonId: string) =>
	db.query.seasonalIngredients.findMany({
		where: eq(seasonalIngredients.seasonId, seasonId),
		with: {
			ingredient: true,
		},
	});

export type SeasonalIngredientWithRelations = Awaited<ReturnType<typeof getSeasonalIngredientsQuery>>[number];

export async function getIngredientsBySeasonId(seasonId: string): Promise<SeasonalIngredientWithRelations[]> {
	return await getSeasonalIngredientsQuery(seasonId);
}

export async function updateSeasonalIngredientsForSeason(
	seasonId: string,
	ingredientIds: string[],
	userId: string,
): Promise<void> {
	// find existing ones
	const existingIngredientIds = await db
		.select({ ingredientId: seasonalIngredients.ingredientId })
		.from(seasonalIngredients)
		.where(eq(seasonalIngredients.seasonId, seasonId))
		.then(rows => rows.map(row => row.ingredientId));

	requestInfo.ctx.logger.info(`Existing ingredient IDs: ${JSON.stringify(existingIngredientIds, null, 4)} `);

	// insert and ignore conflicts for new ones
	const insertValues = ingredientIds.map(ingredientId => ({
		seasonId,
		ingredientId,
		createdBy: userId,
	}));
	await db.insert(seasonalIngredients).values(insertValues).onConflictDoNothing();

	requestInfo.ctx.logger.info(
		`Inserted/ignored seasonal ingredients for season ${seasonId}: ${JSON.stringify(insertValues, null, 4)} `,
	);

	// delete the existing ones not in the new list
	const removedIngredientIds = existingIngredientIds.filter(id => !ingredientIds.includes(id));
	await db
		.delete(seasonalIngredients)
		.where(and(inArray(seasonalIngredients.ingredientId, removedIngredientIds), eq(seasonalIngredients.seasonId, seasonId)));

	requestInfo.ctx.logger.info(`Removed ingredient IDs: ${JSON.stringify(removedIngredientIds, null, 4)} `);

	requestInfo.ctx.logger.info(`Updated seasonal ingredients for season ${seasonId}`);
}
