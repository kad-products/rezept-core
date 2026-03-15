'use server';

import { env } from 'cloudflare:workers';
import { requestInfo, serverAction } from 'rwsdk/worker';
import { requirePermissions } from '@/middleware/permissions';
import { createApiKey, updateApiKey } from '@/repositories/api-keys';
import { apiKeyFormSchema } from '@/schemas';
import type { ActionState, APIKey, APIKeyFormData } from '@/types';

export const saveAPIKey = serverAction([requirePermissions('apiKeys:create', 'apiKeys:update'), _saveAPIKey]);

/**
 * @private - exported for testing only, do not use directly
 */
export async function _saveAPIKey(formData: APIKeyFormData): Promise<ActionState<APIKeyFormData>> {
	const { ctx } = requestInfo;
	const userId = ctx.user?.id;

	if (!userId) {
		return {
			success: false,
			errors: { _form: ['You must be logged in'] },
		};
	}

	requestInfo.ctx.logger.info(`Form data received: ${JSON.stringify(formData, null, 4)} `);

	const parsed = apiKeyFormSchema.safeParse(formData);

	if (parsed.error) {
		return {
			success: false,
			errors: parsed.error.flatten().fieldErrors,
		};
	}

	requestInfo.ctx.logger.info(`Validated form data: ${JSON.stringify(parsed, null, 4)} `);

	let apiKey: APIKey;
	try {
		if (parsed.data.id) {
			apiKey = await updateApiKey(parsed.data.id, parsed.data, userId);
		} else {
			apiKey = await createApiKey(parsed.data, userId);
		}
		requestInfo.ctx.logger.info(`API Key ${apiKey.id} saved`);

		return {
			success: true,
			data: apiKey,
		};
	} catch (error) {
		requestInfo.ctx.logger.info(`Error saving recipe: ${error} `);

		const errorMessage =
			env.REZEPT_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to save item';

		return {
			success: false,
			errors: { _form: [errorMessage] },
		};
	}
}
