import { eq, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import type RzLogger from '@/logger';
import { seasons } from '@/models';
import type { SeasonDBRead, SeasonWriteInput } from '@/types';
import { validateUuid } from './utils';

export async function getSeasons(logger: RzLogger): Promise<SeasonDBRead[]> {
	logger.debug('Fetching all seasons');
	const allSeasons = await db.select().from(seasons);
	logger.debug(`Fetched ${allSeasons.length} seasons`);
	return allSeasons;
}

export async function getSeasonById(seasonId: string, logger: RzLogger): Promise<SeasonDBRead> {
	if (!validateUuid(seasonId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [seasonId, 'Season']);
	}

	logger.debug(`Fetching season ${seasonId}`);
	const matchedSeasons = await db.select().from(seasons).where(eq(seasons.id, seasonId));

	if (matchedSeasons.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [matchedSeasons.length, 1, 'Season']);
	}

	return matchedSeasons[0];
}

export async function createSeason(season: SeasonWriteInput, userId: string, logger: RzLogger): Promise<SeasonDBRead> {
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
	seasonData: SeasonWriteInput,
	userId: string,
	logger: RzLogger,
): Promise<SeasonDBRead> {
	logger.debug(`Updating season ${seasonId}`);

	const updatedSeasons = await db
		.update(seasons)
		.set({
			...seasonData,
			updatedAt: sql`(datetime('now', 'localtime'))`,
			updatedBy: userId,
		})
		.where(eq(seasons.id, seasonId))
		.returning();

	logger.info(`Updated season ${seasonId}`);
	return updatedSeasons[0];
}
