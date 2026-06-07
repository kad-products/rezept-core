'use server';

import { requestInfo, serverAction } from 'rwsdk/worker';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { createApiKey, updateApiKey } from '@/repositories';
import { apiKeysSchemas } from '@/schemas';
import type { ActionState, ApiKeyDBRead, ApiKeyFormInput } from '@/types';
import { errorResponse, successResponse } from './utils';

export const saveApiKey = serverAction([
	requireAuthentication,
	requirePermissions('api-keys:create', 'api-keys:update'),
	_saveApiKey,
]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveApiKey(formData: ApiKeyFormInput): Promise<ActionState<ApiKeyDBRead>> {
	const { ctx } = requestInfo;
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
	const userId = ctx.user!.id;

	requestInfo.ctx.logger.debug('API key form data received', { id: formData.id, name: formData.name });

	const parsed = apiKeysSchemas.form.safeParse(formData);

	if (parsed.error) {
		return errorResponse<ApiKeyDBRead>(parsed.error.flatten().fieldErrors, 400);
	}

	let apiKey: ApiKeyDBRead;
	try {
		if (parsed.data.id) {
			apiKey = await updateApiKey(parsed.data.id, parsed.data, userId, requestInfo.ctx.logger);
		} else {
			apiKey = await createApiKey(parsed.data, userId, requestInfo.ctx.logger);
		}
		requestInfo.ctx.logger.info('API key saved', { apiKeyId: apiKey.id });

		return successResponse<ApiKeyDBRead>(apiKey, 200);
	} catch (error) {
		requestInfo.ctx.logger.error('Failed to save API key', { error });
		return errorResponse<ApiKeyDBRead>(error, 400, 'Failed to save item');
	}
}
