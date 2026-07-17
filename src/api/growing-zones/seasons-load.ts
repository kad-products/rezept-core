import { env } from 'cloudflare:workers';
import type { RequestInfo } from 'rwsdk/worker';
import { apiErrorResponse, errorResponse, successResponse } from '@/api/utils';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { getGrowingZoneById } from '@/repositories';
import { ingredientSeasonsSchemas } from '@/schemas';
import { readCsvFromR2Object, saveGrowingZonesSeasonsLoad } from '@/steps';
import type { IngredientSeasonLoadRecord } from '@/types';

export default {
	post: [requireAuthentication, requirePermissions('ingredient-seasons:load'), _postHandler] as const,
};

/**
 * @private - exported for testing only, do not use directly
 */
export async function _postHandler({ request, ctx, params }: RequestInfo): Promise<Response> {
	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;
	const growingZoneId = params.growingZoneId;

	const formData = await request.formData();
	const file = formData.get('file');

	if (!growingZoneId) {
		return errorResponse(`Growing Zone selection required`, 400);
	}

	try {
		await getGrowingZoneById(growingZoneId, ctx.logger);
	} catch (err) {
		return apiErrorResponse(err, `Error fetching growing zone`);
	}

	if (!(file instanceof File)) {
		return errorResponse('A file is required', 400);
	}

	const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
	if (file.size > MAX_FILE_SIZE) {
		return errorResponse('File exceeds the 100MB size limit', 413);
	}

	const key = `growing-zones/seasons-load/${new Date().toISOString().replace(/[TZ:\-.]/g, '')}`;

	// Stream the file directly to R2
	await env.REZEPT_ADMIN_OPERATIONS.put(key, file.stream(), {
		httpMetadata: {
			contentType: file.type,
		},
	});

	ctx.logger.info('Ingredient seasons file uploaded', { key, size: file.size });

	const ingredientSeasonsData = await readCsvFromR2Object<IngredientSeasonLoadRecord>(
		env.REZEPT_ADMIN_OPERATIONS,
		key,
		ctx.logger,
		ingredientSeasonsSchemas.loadRecord,
	);

	const savedIngredientSeasons = await saveGrowingZonesSeasonsLoad(ingredientSeasonsData, growingZoneId, userId, ctx.logger);

	return successResponse({ key, recordCount: ingredientSeasonsData.length, ingredients: savedIngredientSeasons });
}
