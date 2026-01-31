import { eq } from 'drizzle-orm';
import db from '@/db';
import { type SeasonalIngredient, seasonalIngredients } from '@/models/schema';

const getSeasonalIngredientsQuery = (seasonId: string) =>
	db.query.seasonalIngredients.findMany({
		where: eq(seasonalIngredients.seasonId, seasonId),
		with: {
			ingredient: true,
		},
	});

export type SeasonalIngredientWithRelations = Awaited<
	ReturnType<typeof getSeasonalIngredientsQuery>
>[number];

export async function getIngredientsBySeasonId(
	seasonId: string,
): Promise<SeasonalIngredientWithRelations[]> {
	return await getSeasonalIngredientsQuery(seasonId);
}
