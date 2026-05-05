import { eq } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import type RzLogger from '@/logger';
import { apiKeys } from '@/models';
import type { ApiKeyDBRead, ApiKeyFormInput } from '@/types';
import { validateUuid } from './utils';

export async function getApiKeysByUserId(userId: string, logger: RzLogger): Promise<ApiKeyDBRead[]> {
	logger.debug(`Fetching API keys for user ${userId}`);
	const matchedApiKeys = await db.select().from(apiKeys).where(eq(apiKeys.userId, userId));
	logger.debug(`Fetched ${matchedApiKeys.length} API keys for user ${userId}`);
	return matchedApiKeys;
}

export async function getApiKeyById(apiKeyId: string, logger: RzLogger): Promise<ApiKeyDBRead> {
	if (!validateUuid(apiKeyId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [apiKeyId, 'ApiKey']);
	}

	logger.debug(`Fetching API key ${apiKeyId}`);
	const matchedApiKeys = await db.select().from(apiKeys).where(eq(apiKeys.id, apiKeyId));

	if (matchedApiKeys.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [matchedApiKeys.length, 1, 'ApiKey']);
	}

	return matchedApiKeys[0];
}

export async function getApiKeyByKey(key: string, logger: RzLogger): Promise<ApiKeyDBRead> {
	logger.debug('Fetching API key by key');
	const matchedApiKeys = await db.select().from(apiKeys).where(eq(apiKeys.apiKey, key));

	if (matchedApiKeys.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [matchedApiKeys.length, 1, 'ApiKey']);
	}

	return matchedApiKeys[0];
}

export async function createApiKey(apiKey: ApiKeyFormInput, actingUserId: string, logger: RzLogger): Promise<ApiKeyDBRead> {
	logger.debug('Creating API key');

	const insertedRecipes = await db
		.insert(apiKeys)
		.values({
			...apiKey,
			createdBy: actingUserId,
		})
		.returning();

	const result = insertedRecipes[0];
	logger.info(`Created API key ${result.id}`);
	return result;
}

export async function updateApiKey(
	apiKeyId: string,
	apiKey: ApiKeyFormInput,
	actingUserId: string,
	logger: RzLogger,
): Promise<ApiKeyDBRead> {
	logger.debug(`Updating API key ${apiKeyId}`);

	const updatedApiKeys = await db
		.update(apiKeys)
		.set({
			...apiKey,
			updatedBy: actingUserId,
		})
		.where(eq(apiKeys.id, apiKeyId))
		.returning();

	if (updatedApiKeys.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [updatedApiKeys.length, 1, 'ApiKey']);
	}

	logger.info(`Updated API key ${apiKeyId}`);
	return updatedApiKeys[0];
}
