import { eq } from 'drizzle-orm';
import { requestInfo } from 'rwsdk/worker';
import db from '@/db';
import { apiKeys } from '@/models';
import type { ApiKey, ApiKeyFormData } from '@/types';
import { validateUuid } from '@/utils';

export async function getApiKeysByUserId(userId: string): Promise<ApiKey[]> {
	const matchedApiKeys = await db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
	return matchedApiKeys;
}

export async function getApiKeyById(apiKeyId: string): Promise<ApiKey> {
	if (!validateUuid(apiKeyId)) {
		throw new Error(`Invalid id: ${apiKeyId}`);
	}

	const matchedApiKeys = await db.select().from(apiKeys).where(eq(apiKeys.id, apiKeyId));

	if (matchedApiKeys.length !== 1) {
		throw new Error(`getApiKeyById: matchedApiKeys length is ${matchedApiKeys.length} for id ${apiKeyId}`);
	}

	return matchedApiKeys[0];
}

export async function getApiKeyByKey(key: string): Promise<ApiKey> {
	const matchedApiKeys = await db.select().from(apiKeys).where(eq(apiKeys.apiKey, key));

	if (matchedApiKeys.length !== 1) {
		throw new Error(`getApiKeyByKey: matchedApiKeys length is ${matchedApiKeys.length} for key ${key.substring(0, 12)}`);
	}

	return matchedApiKeys[0];
}

export async function createApiKey(apiKey: ApiKeyFormData, userId: string) {
	requestInfo.ctx.logger.info(`Form data in createApiKey: ${JSON.stringify(apiKey, null, 4)} `);

	const insertedRecipes = await db
		.insert(apiKeys)
		.values({
			...apiKey,
			createdBy: userId,
		})
		.returning();

	return insertedRecipes[0];
}

export async function updateApiKey(apiKeyId: string, apiKey: ApiKeyFormData, userId: string) {
	requestInfo.ctx.logger.info(`Form data in updateApiKey: ${JSON.stringify(apiKey, null, 4)} `);

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
