import { and, eq, isNull, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import type RzLogger from '@/logger';
import { images } from '@/models';
import type { ImageDBRead, ImageWriteInput } from '@/types';
import { validateUuid } from './utils';

export async function getImages(logger: RzLogger): Promise<ImageDBRead[]> {
	logger.debug('Fetching all images');
	const results = await db.select().from(images).where(isNull(images.deletedAt));
	logger.debug(`Fetched ${results.length} images`);
	return results;
}

export async function getImageById(imageId: string, logger: RzLogger): Promise<ImageDBRead> {
	if (!validateUuid(imageId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [imageId, 'Image']);
	}

	logger.debug(`Fetching image ${imageId}`);
	const results = await db
		.select()
		.from(images)
		.where(and(eq(images.id, imageId), isNull(images.deletedAt)));

	if (results.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [results.length, 1, 'Image']);
	}

	return results[0];
}

export async function createImage(image: ImageWriteInput, actingUserId: string, logger: RzLogger): Promise<ImageDBRead> {
	logger.debug(`Creating image "${image.name}"`);

	const inserted = await db
		.insert(images)
		.values({ ...image, createdBy: actingUserId })
		.returning();

	const result = inserted[0];
	logger.info(`Created image ${result.id}`);
	return result;
}

export async function updateImage(
	imageId: string,
	image: ImageWriteInput,
	actingUserId: string,
	logger: RzLogger,
): Promise<ImageDBRead> {
	if (!validateUuid(imageId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [imageId, 'Image']);
	}

	logger.debug(`Updating image ${imageId}`);

	const updated = await db
		.update(images)
		.set({ ...image, updatedAt: sql`(datetime('now', 'localtime'))`, updatedBy: actingUserId })
		.where(eq(images.id, imageId))
		.returning();

	if (updated.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [updated.length, 1, 'Image']);
	}

	logger.info(`Updated image ${updated[0].id}`);
	return updated[0];
}

export async function deleteImage(imageId: string, actingUserId: string, logger: RzLogger): Promise<ImageDBRead> {
	if (!validateUuid(imageId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [imageId, 'Image']);
	}

	logger.debug(`Deleting image ${imageId}`);

	const deleted = await db
		.update(images)
		.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: actingUserId })
		.where(eq(images.id, imageId))
		.returning();

	if (deleted.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [deleted.length, 1, 'Image']);
	}

	logger.info(`Deleted image ${deleted[0].id}`);
	return deleted[0];
}
