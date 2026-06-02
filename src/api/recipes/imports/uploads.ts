import { env } from 'cloudflare:workers';
import crypto from 'node:crypto';
import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { apiErrorResponse, errorResponse, successResponse } from '@/api/utils';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { createRecipeUpload } from '@/repositories';
import type { RecipeUploadDBRead } from '@/types';

export default {
	post: [requireAuthentication, requirePermissions('recipes:upload'), _postHandler] as const,
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
	const uploadId = crypto.randomUUID();

	// Stream the file directly to R2
	const results = await env.rezept_recipe_uploads.put(uploadId, file.stream(), {
		httpMetadata: {
			contentType: file.type,
		},
	});

	let uploadedRecipe: RecipeUploadDBRead;
	try {
		uploadedRecipe = await createRecipeUpload(
			{
				id: uploadId,
				originalFilename: file.name,
				mimeType: file.type,
				fileSize: file.size,
				status: 'UPLOADED',
			},
			userId,
			userId,
			ctx.logger,
		);
	} catch (err) {
		ctx.logger.info(`Error uploading recipe: ${err} `);
		return apiErrorResponse(err, 'Error uploading recipe');
	}

	ctx.logger.info(results);

	return successResponse(uploadedRecipe);
}
