'use server';

import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { createApiKey, updateApiKey } from '@/repositories';
import { apiKeysSchemas } from '@/schemas';
import type { ActionState, ApiKey, ApiKeyFormData } from '@/types';
import { errorResponse, successResponse } from './utils';

// biome-ignore lint/nursery/useExplicitType: WrappedServerFunction return type is not exported from rwsdk
export const saveApiKey = serverAction([
	requireAuthentication,
	requirePermissions('apiKeys:create', 'apiKeys:update'),
	_saveApiKey,
]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveApiKey(formData: ApiKeyFormData): Promise<ActionState<ApiKeyFormData>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	requestInfo.ctx.logger.info(`Form data received: ${JSON.stringify(formData, null, 4)} `);

	const parsed = apiKeysSchemas.form.safeParse(formData);

	if (parsed.error) {
		return errorResponse<ApiKeyFormData>(parsed.error.flatten().fieldErrors, 400);
	}

	requestInfo.ctx.logger.info(`Validated form data: ${JSON.stringify(parsed, null, 4)} `);

	let apiKey: ApiKey;
	try {
		if (parsed.data.id) {
			apiKey = await updateApiKey(parsed.data.id, parsed.data, userId, requestInfo.ctx.logger);
		} else {
			apiKey = await createApiKey(parsed.data, userId, requestInfo.ctx.logger);
		}
		requestInfo.ctx.logger.info(`API Key ${apiKey.id} saved`);

		return successResponse<ApiKeyFormData>(apiKey, 200);
	} catch (error) {
		requestInfo.ctx.logger.info(`Error saving API Key: ${error} `);
		return errorResponse<ApiKeyFormData>(error, 400, 'Failed to save item');
	}
}
