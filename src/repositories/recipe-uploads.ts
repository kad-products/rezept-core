import { eq } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import type RzLogger from '@/logger';
import { recipeUploads } from '@/models';
import type { RecipeUploadDBRead, RecipeUploadWriteInput } from '@/types';
import { validateUuid } from './utils';

export async function createRecipeUpload(
	recipeUpload: RecipeUploadWriteInput,
	userId: string,
	logger: RzLogger,
): Promise<RecipeUploadDBRead> {
	logger.debug('Creating recipe upload');

	const recipesUploaded = await db
		.insert(recipeUploads)
		.values({
			...recipeUpload,
			userId,
			createdBy: userId,
		})
		.returning();

	const result = recipesUploaded[0];
	logger.info(`Created recipe upload ${result.id}`);
	return result;
}

export async function getRecipeUploads(userId: string, logger: RzLogger): Promise<RecipeUploadDBRead[]> {
	logger.debug(`Fetching recipe uploads for user ${userId}`);
	const results = await db.select().from(recipeUploads).where(eq(recipeUploads.userId, userId));
	logger.debug(`Fetched ${results.length} recipe uploads`);
	return results;
}

export async function getRecipeUploadById(recipeUploadId: string, logger: RzLogger): Promise<RecipeUploadDBRead> {
	if (!validateUuid(recipeUploadId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [recipeUploadId, 'RecipeUpload']);
	}

	logger.debug(`Fetching recipe upload ${recipeUploadId}`);
	const matchedRecipeUploads = await db.select().from(recipeUploads).where(eq(recipeUploads.id, recipeUploadId));

	if (matchedRecipeUploads.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [matchedRecipeUploads.length, 1, 'RecipeUpload']);
	}

	return matchedRecipeUploads[0];
}
