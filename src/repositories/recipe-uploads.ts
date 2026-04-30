import { eq } from 'drizzle-orm';
import { requestInfo } from 'rwsdk/worker';
import db from '@/db';
import type RzLogger from '@/logger';
import { recipeUploads } from '@/models';
import type { RecipeUpload, RecipeUploadFormData } from '@/types';
import { validateUuid } from './utils';

export async function createRecipeUpload(
	recipeUpload: RecipeUploadFormData,
	userId: string,
	logger: RzLogger,
): Promise<RecipeUpload> {
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

export async function getRecipeUploads(logger: RzLogger): Promise<RecipeUpload[]> {
	if (!requestInfo.ctx.user) {
		return [];
	}

	logger.debug(`Fetching recipe uploads for user ${requestInfo.ctx.user.id}`);
	const results = await db.select().from(recipeUploads).where(eq(recipeUploads.userId, requestInfo.ctx.user.id));
	logger.debug(`Fetched ${results.length} recipe uploads`);
	return results;
}

export async function getRecipeUploadById(recipeUploadId: string, logger: RzLogger): Promise<RecipeUpload> {
	if (!validateUuid(recipeUploadId)) {
		throw new Error(`Invalid id: ${recipeUploadId}`);
	}

	logger.debug(`Fetching recipe upload ${recipeUploadId}`);
	const matchedRecipeUploads = await db.select().from(recipeUploads).where(eq(recipeUploads.id, recipeUploadId));

	if (matchedRecipeUploads.length !== 1) {
		throw new Error(
			`getRecipeUploadById: matchedRecipeUploads length is ${matchedRecipeUploads.length} for id ${recipeUploadId}`,
		);
	}

	return matchedRecipeUploads[0];
}
