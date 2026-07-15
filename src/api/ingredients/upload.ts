import { env } from 'cloudflare:workers';
import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { errorResponse, successResponse } from '@/api/utils';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { ingredientsSchemas } from '@/schemas';
import { readCsvFromR2Object, saveIngredientLoad } from '@/steps';
import type { IngredientLoadRecord } from '@/types';

export default {
	post: [requireAuthentication, requirePermissions('ingredients:load'), _postHandler] as const,
};

/**
 * @private - exported for testing only, do not use directly
 */
export async function _postHandler({ request, ctx }: RequestInfo<DefaultAppContext>): Promise<Response> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;

	const formData = await request.formData();
	const file = formData.get('file');

	if (!(file instanceof File)) {
		return errorResponse('A file is required', 400);
	}

	const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
	if (file.size > MAX_FILE_SIZE) {
		return errorResponse('File exceeds the 100MB size limit', 413);
	}

	// Generate the ID upfront so it can be used as the R2 key (id == R2 key by convention)
	const key = `ingredients/${new Date().toISOString().replace(/[TZ:\-.]/g, '')}`;

	// Stream the file directly to R2
	await env.REZEPT_ADMIN_OPERATIONS.put(key, file.stream(), {
		httpMetadata: {
			contentType: file.type,
		},
	});

	ctx.logger.info('Ingredient file uploaded', { key, size: file.size });

	const ingredientsData = await readCsvFromR2Object<IngredientLoadRecord>(
		env.REZEPT_ADMIN_OPERATIONS,
		key,
		ctx.logger,
		ingredientsSchemas.loadRecord,
	);
	const savedIngredients = await saveIngredientLoad(ingredientsData, userId, ctx.logger);

	return successResponse({ key, recordCount: ingredientsData.length, ingredients: savedIngredients });
}
