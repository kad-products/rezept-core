import { eq } from 'drizzle-orm';
import { requestInfo } from 'rwsdk/worker';
import db from '@/db';
import { recipeUploads } from '@/models';
import type { RecipeUpload, RecipeUploadFormData } from '@/types';
import { validateUuid } from './utils';

export async function createRecipeUpload(recipeUpload: RecipeUploadFormData, userId: string): Promise<RecipeUpload> {
	requestInfo.ctx.logger.info(`Form data in createRecipeUpload: ${JSON.stringify(recipeUpload, null, 4)} `);

	const recipesUploaded = await db
		.insert(recipeUploads)
		.values({
			...recipeUpload,
			userId,
			createdBy: userId,
		})
		.returning();

	return recipesUploaded[0];
}

export async function getRecipeUploads(): Promise<RecipeUpload[]> {
	if (!requestInfo.ctx.user) {
		return [];
	}

	return await db.select().from(recipeUploads).where(eq(recipeUploads.userId, requestInfo.ctx.user.id));
}

export async function getRecipeUploadById(recipeUploadId: string): Promise<RecipeUpload> {
	if (!validateUuid(recipeUploadId)) {
		throw new Error(`Invalid id: ${recipeUploadId}`);
	}

	const matchedRecipeUploads = await db.select().from(recipeUploads).where(eq(recipeUploads.id, recipeUploadId));

	if (matchedRecipeUploads.length !== 1) {
		throw new Error(
			`getRecipeUploadById: matchedRecipeUploads length is ${matchedRecipeUploads.length} for id ${recipeUploadId}`,
		);
	}

	return matchedRecipeUploads[0];
}
