import { eq } from 'drizzle-orm';
import { requestInfo } from 'rwsdk/worker';
import db from '@/db';
import { apiKeys } from '@/models';
import type { APIKey, APIKeyFormData } from '@/types';
import { validateUuid } from '@/utils';

export async function getApiKeysByUserId(userId: string): Promise<APIKey[]> {
	const matchedAPIKeys = await db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
	return matchedAPIKeys;
}

export async function getApiKeyById(apiKeyId: string): Promise<APIKey> {
	if (!validateUuid(apiKeyId)) {
		throw new Error(`Invalid id: ${apiKeyId}`);
	}

	const matchedAPIKeys = await db.select().from(apiKeys).where(eq(apiKeys.id, apiKeyId));

	if (matchedAPIKeys.length !== 1) {
		throw new Error(`getApiKeyById: matchedAPIKeys length is ${matchedAPIKeys.length} for id ${apiKeyId}`);
	}

	return matchedAPIKeys[0];
}

export async function createApiKey(apiKey: APIKeyFormData, userId: string) {
	requestInfo.ctx.logger.info(`Form data in createAPIKey: ${JSON.stringify(apiKey, null, 4)} `);

	const insertedRecipes = await db
		.insert(apiKeys)
		.values({
			...apiKey,
			createdBy: userId,
		})
		.returning();

	return insertedRecipes[0];
}

export async function updateApiKey(apiKeyId: string, apiKey: APIKeyFormData, userId: string) {
	requestInfo.ctx.logger.info(`Form data in updateAPIKey: ${JSON.stringify(apiKey, null, 4)} `);

	const updatedRecipes = await db
		.update(apiKeys)
		.set({
			...apiKey,
			updatedBy: userId,
		})
		.where(eq(apiKeys.id, apiKeyId))
		.returning();

	if (updatedRecipes.length !== 1) {
		throw new Error(`updateApiKey: updated ${updatedRecipes.length} records instead of 1`);
	}

	return updatedRecipes[0];
}
