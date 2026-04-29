import { eq } from 'drizzle-orm';
import db from '@/db';
import type RzLogger from '@/logger';
import { seasons } from '@/models';
import type { Season, SeasonFormSave } from '@/types';
import { validateUuid } from './utils';

export async function getSeasons(logger: RzLogger): Promise<Season[]> {
	logger.debug('Fetching all seasons');
	const allSeasons = await db.select().from(seasons);
	logger.debug(`Fetched ${allSeasons.length} seasons`);
	return allSeasons;
}

export async function getSeasonById(seasonId: string, logger: RzLogger): Promise<Season> {
	if (!validateUuid(seasonId)) {
		throw new Error(`Invalid id: ${seasonId}`);
	}
	logger.debug(`Fetching season ${seasonId}`);
	const matchedSeasons = await db.select().from(seasons).where(eq(seasons.id, seasonId));
	if (matchedSeasons.length !== 1) {
		throw new Error(`getSeasonById: matchedSeasons length is ${matchedSeasons.length} for id ${seasonId}`);
	}

	return matchedSeasons[0];
}

export async function createSeason(season: SeasonFormSave, userId: string, logger: RzLogger): Promise<Season> {
	logger.debug('Creating season');

	const createdSeasons = await db
		.insert(seasons)
		.values({
			...season,
			createdBy: userId,
		})
		.returning();

	const result = createdSeasons[0];
	logger.info(`Created season ${result.id}`);
	return result;
}

export async function updateSeason(
	seasonId: string,
	seasonData: SeasonFormSave,
	userId: string,
	logger: RzLogger,
): Promise<Season> {
	logger.debug(`Updating season ${seasonId}`);

	const updatedSeasons = await db
		.update(seasons)
		.set({
			...seasonData,
			updatedBy: userId,
		})
		.where(eq(seasons.id, seasonId))
		.returning();

	logger.info(`Updated season ${seasonId}`);
	return updatedSeasons[0];
}
