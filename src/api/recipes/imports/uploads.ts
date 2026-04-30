import { env } from 'cloudflare:workers';
import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { apiErrorResponse, successResponse } from '@/api/utils';
import { requireAuthentication } from '@/interrupters/require-authentication';
import { requirePermissions } from '@/middleware/permissions';
import { createRecipeUpload } from '@/repositories/recipe-uploads';
import type { RecipeUpload } from '@/types';

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
	const file = formData.get('file') as File;

	ctx.logger.info(formData);
	ctx.logger.info(file);

	// Stream the file directly to R2
	const r2ObjectKey = `/raw/${file.name}`;
	const results = await env.rezept_recipe_uploads.put(r2ObjectKey, file.stream(), {
		httpMetadata: {
			contentType: file.type,
		},
	});

	let uploadedRecipe: RecipeUpload;
	try {
		uploadedRecipe = await createRecipeUpload(
			{
				originalFilename: file.name,
				r2Key: r2ObjectKey,
				mimeType: file.type,
				fileSize: file.size,
				status: 'UPLOADED',
			},
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
