import { eq } from 'drizzle-orm';
import db from '@/db';
import type RzLogger from '@/logger';
import { apiKeys } from '@/models';
import type { ApiKey, ApiKeyFormData } from '@/types';
import { validateUuid } from './utils';

export async function getApiKeysByUserId(userId: string, logger: RzLogger): Promise<ApiKey[]> {
	logger.debug(`Fetching API keys for user ${userId}`);
	const matchedApiKeys = await db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
	logger.debug(`Fetched ${matchedApiKeys.length} API keys for user ${userId}`);
	return matchedApiKeys;
}

export async function getApiKeyById(apiKeyId: string, logger: RzLogger): Promise<ApiKey> {
	if (!validateUuid(apiKeyId)) {
		throw new Error(`Invalid id: ${apiKeyId}`);
	}

	logger.debug(`Fetching API key ${apiKeyId}`);
	const matchedApiKeys = await db.select().from(apiKeys).where(eq(apiKeys.id, apiKeyId));

	if (matchedApiKeys.length !== 1) {
		throw new Error(`getApiKeyById: matchedApiKeys length is ${matchedApiKeys.length} for id ${apiKeyId}`);
	}

	return matchedApiKeys[0];
}

export async function getApiKeyByKey(key: string, logger: RzLogger): Promise<ApiKey> {
	logger.debug('Fetching API key by key');
	const matchedApiKeys = await db.select().from(apiKeys).where(eq(apiKeys.apiKey, key));

	if (matchedApiKeys.length !== 1) {
		throw new Error(`getApiKeyByKey: matchedApiKeys length is ${matchedApiKeys.length} for key ${key.substring(0, 12)}`);
	}

	return matchedApiKeys[0];
}

export async function createApiKey(apiKey: ApiKeyFormData, userId: string, logger: RzLogger): Promise<ApiKey> {
	logger.debug('Creating API key');

	const insertedRecipes = await db
		.insert(apiKeys)
		.values({
			...apiKey,
			createdBy: userId,
		})
		.returning();

	const result = insertedRecipes[0];
	logger.info(`Created API key ${result.id}`);
	return result;
}

export async function updateApiKey(apiKeyId: string, apiKey: ApiKeyFormData, userId: string, logger: RzLogger): Promise<ApiKey> {
	logger.debug(`Updating API key ${apiKeyId}`);

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

	logger.info(`Updated API key ${apiKeyId}`);
	return updatedRecipes[0];
}
