import { and, eq, isNull, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import { growingZones } from '@/models';
import type { GrowingZoneDBRead, GrowingZoneFormInput, GrowingZoneWithSeasons, RzLogger } from '@/types';
import { validateUuid } from './utils';

export async function getGrowingZones(logger: RzLogger): Promise<GrowingZoneDBRead[]> {
	logger.debug('Fetching all growing zones');
	const allGrowingZones = await db.select().from(growingZones).where(isNull(growingZones.deletedAt));
	logger.debug(`Fetched ${allGrowingZones.length} growing zones`);
	return allGrowingZones;
}

export async function getGrowingZoneById(growingZoneId: string, logger: RzLogger): Promise<GrowingZoneWithSeasons> {
	if (!validateUuid(growingZoneId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [growingZoneId, 'Growing Zone']);
	}

	logger.debug(`Fetching growing zone ${growingZoneId}`);
	const growingZone = await db.query.growingZones.findFirst({
		where: and(eq(growingZones.id, growingZoneId), isNull(growingZones.deletedAt)),
		with: {
			seasons: {
				with: {
					ingredient: true,
				},
			},
		},
	});

	if (!growingZone) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [0, 1, 'Growing Zone']);
	}

	return growingZone;
}

export async function createGrowingZone(
	growingZone: GrowingZoneFormInput,
	userId: string,
	logger: RzLogger,
): Promise<GrowingZoneDBRead> {
	logger.debug('Creating growing zone');

	const createdGrowingZones = await db
		.insert(growingZones)
		.values({
			...growingZone,
			createdBy: userId,
		})
		.returning();

	const result = createdGrowingZones[0];
	logger.info(`Created growing zone ${result.id}`);
	return result;
}

export async function deleteGrowingZone(growingZoneId: string, userId: string, logger: RzLogger): Promise<GrowingZoneDBRead> {
	if (!validateUuid(growingZoneId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [growingZoneId, 'Growing Zone']);
	}
	logger.debug(`Deleting growing zone ${growingZoneId}`);

	const deleted = await db
		.update(growingZones)
		.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: userId })
		.where(eq(growingZones.id, growingZoneId))
		.returning();

	if (deleted.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [deleted.length, 1, 'Growing Zone']);
	}

	logger.info(`Deleted growing zone ${growingZoneId}`);
	return deleted[0];
}

export async function updateGrowingZone(
	growingZoneId: string,
	growingZone: GrowingZoneFormInput,
	userId: string,
	logger: RzLogger,
): Promise<GrowingZoneDBRead> {
	if (!validateUuid(growingZoneId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [growingZoneId, 'Growing Zone']);
	}
	logger.debug(`Updating growing zone ${growingZoneId}`);

	const updatedGrowingZones = await db
		.update(growingZones)
		.set({
			...growingZone,
			updatedAt: sql`(datetime('now', 'localtime'))`,
			updatedBy: userId,
		})
		.where(eq(growingZones.id, growingZoneId))
		.returning();

	if (updatedGrowingZones.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [updatedGrowingZones.length, 1, 'Growing Zone']);
	}
	logger.info(`Updated growing zone ${growingZoneId}`);
	return updatedGrowingZones[0];
}
