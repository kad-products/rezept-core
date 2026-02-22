import { eq } from 'drizzle-orm';
import db from '@/db';
import { seasons } from '@/models';
import type { Season, SeasonFormSave } from '@/types';
import { validateUuid } from '@/utils';

export async function getSeasons(): Promise<Season[]> {
	const allSeasons = await db.select().from(seasons);
	return allSeasons;
}

export async function getSeasonById(seasonId: string): Promise<Season> {
	if (!validateUuid(seasonId)) {
		throw new Error(`Invalid id: ${seasonId}`);
	}
	const matchedSeasons = await db.select().from(seasons).where(eq(seasons.id, seasonId));
	if (matchedSeasons.length !== 1) {
		throw new Error(`getSeasonById: matchedSeasons length is ${matchedSeasons.length} for id ${seasonId}`);
	}

	return matchedSeasons[0];
}

export async function createSeason(season: SeasonFormSave, userId: string) {
	console.log(`Form data in createSeason: ${JSON.stringify(season, null, 4)} `);

	const createdSeasons = await db
		.insert(seasons)
		.values({
			...season,
			createdBy: userId,
		})
		.returning();

	console.log(`Created season: ${JSON.stringify(createdSeasons, null, 4)}`);

	return createdSeasons[0];
}

export async function updateSeason(seasonId: string, seasonData: SeasonFormSave, userId: string) {
	console.log(`Form data in updateSeason: ${JSON.stringify(seasonData, null, 4)} `);

	const updatedSeasons = await db
		.update(seasons)
		.set({
			...seasonData,
			updatedBy: userId,
		})
		.where(eq(seasons.id, seasonId))
		.returning();

	console.log(`Updated ${updatedSeasons.length} Seasons`);

	return updatedSeasons[0];
}
