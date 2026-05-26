import { and, eq, isNull, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import type RzLogger from '@/logger';
import { imageTypes } from '@/models';
import type { ImageTypeDBRead, ImageTypeWriteInput } from '@/types';
import { validateUuid } from './utils';

export async function getImageTypes(logger: RzLogger): Promise<ImageTypeDBRead[]> {
	logger.debug('Fetching all image types');
	const results = await db.select().from(imageTypes).where(isNull(imageTypes.deletedAt));
	logger.debug(`Fetched ${results.length} image types`);
	return results;
}

export async function getImageTypeById(imageTypeId: string, logger: RzLogger): Promise<ImageTypeDBRead> {
	if (!validateUuid(imageTypeId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [imageTypeId, 'ImageType']);
	}

	logger.debug(`Fetching image type ${imageTypeId}`);
	const results = await db
		.select()
		.from(imageTypes)
		.where(and(eq(imageTypes.id, imageTypeId), isNull(imageTypes.deletedAt)));

	if (results.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [results.length, 1, 'ImageType']);
	}

	return results[0];
}

export async function getImageTypeByName(name: string, logger: RzLogger): Promise<ImageTypeDBRead> {
	logger.debug(`Fetching image type "${name}"`);
	const results = await db
		.select()
		.from(imageTypes)
		.where(and(eq(imageTypes.name, name), isNull(imageTypes.deletedAt)));

	if (results.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [results.length, 1, 'ImageType']);
	}

	return results[0];
}

export async function createImageType(
	imageType: ImageTypeWriteInput,
	actingUserId: string,
	logger: RzLogger,
): Promise<ImageTypeDBRead> {
	logger.debug(`Creating image type "${imageType.name}"`);

	const inserted = await db
		.insert(imageTypes)
		.values({ ...imageType, createdBy: actingUserId })
		.returning();

	const result = inserted[0];
	logger.info(`Created image type ${result.id}`);
	return result;
}

export async function updateImageType(
	imageTypeId: string,
	imageType: ImageTypeWriteInput,
	actingUserId: string,
	logger: RzLogger,
): Promise<ImageTypeDBRead> {
	if (!validateUuid(imageTypeId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [imageTypeId, 'ImageType']);
	}

	logger.debug(`Updating image type ${imageTypeId}`);

	const updated = await db
		.update(imageTypes)
		.set({ ...imageType, updatedAt: sql`(datetime('now', 'localtime'))`, updatedBy: actingUserId })
		.where(eq(imageTypes.id, imageTypeId))
		.returning();

	if (updated.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [updated.length, 1, 'ImageType']);
	}

	logger.info(`Updated image type ${updated[0].id}`);
	return updated[0];
}

export async function deleteImageType(imageTypeId: string, actingUserId: string, logger: RzLogger): Promise<ImageTypeDBRead> {
	if (!validateUuid(imageTypeId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [imageTypeId, 'ImageType']);
	}

	logger.debug(`Deleting image type ${imageTypeId}`);

	const deleted = await db
		.update(imageTypes)
		.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: actingUserId })
		.where(eq(imageTypes.id, imageTypeId))
		.returning();

	if (deleted.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [deleted.length, 1, 'ImageType']);
	}

	logger.info(`Deleted image type ${deleted[0].id}`);
	return deleted[0];
}
