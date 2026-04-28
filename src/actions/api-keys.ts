'use server';

import { requestInfo, serverAction } from 'rwsdk/worker';
import { requirePermissions } from '@/middleware/permissions';
import { createApiKey, updateApiKey } from '@/repositories/api-keys';
import { apiKeysSchemas } from '@/schemas';
import type { ActionState, ApiKey, ApiKeyFormData } from '@/types';
import { errorResponse, successResponse } from './utils';

export const saveApiKey = serverAction([requirePermissions('apiKeys:create', 'apiKeys:update'), _saveApiKey]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveApiKey(formData: ApiKeyFormData): Promise<ActionState<ApiKeyFormData>> {
	const { ctx } = requestInfo;
	const userId = ctx.user?.id;

	if (!userId) {
		return errorResponse<ApiKeyFormData>('You must be logged in to perform this action', 401);
	}

	requestInfo.ctx.logger.info(`Form data received: ${JSON.stringify(formData, null, 4)} `);

	const parsed = apiKeysSchemas.form.safeParse(formData);

	if (parsed.error) {
		return errorResponse<ApiKeyFormData>(parsed.error.flatten().fieldErrors, 400);
	}

	requestInfo.ctx.logger.info(`Validated form data: ${JSON.stringify(parsed, null, 4)} `);

	let apiKey: ApiKey;
	try {
		if (parsed.data.id) {
			apiKey = await updateApiKey(parsed.data.id, parsed.data, userId);
		} else {
			apiKey = await createApiKey(parsed.data, userId);
		}
		requestInfo.ctx.logger.info(`API Key ${apiKey.id} saved`);

		return successResponse<ApiKeyFormData>(apiKey, 200);
	} catch (error) {
		requestInfo.ctx.logger.info(`Error saving API Key: ${error} `);
		return errorResponse<ApiKeyFormData>(error, 400, 'Failed to save item');
	}
}
