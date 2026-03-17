import { env } from 'cloudflare:workers';
import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { createRecipeUpload } from '@/repositories/recipe-uploads';
import type { RecipeUpload } from '@/types';

export default async function API__recipes__upload({ request, ctx }: RequestInfo<DefaultAppContext>) {
	const userId = ctx.user?.id;

	if (!userId) {
		return Response.json(
			{
				success: false,
				errors: { _form: ['You must be logged in'] },
			},
			{ status: 400 },
		);
	}

	const formData = await request.formData();
	const file = formData.get('file') as File;

	console.log(formData);
	console.log(file);

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
		);
	} catch (err) {
		ctx.logger.info(`Error saving recipe: ${err} `);

		const errorMessage =
			env.REZEPT_ENV === 'development' ? (err instanceof Error ? err.message : String(err)) : 'Failed to save item';

		return Response.json(
			{
				success: false,
				errors: { _form: [errorMessage] },
			},
			{ status: 500 },
		);
	}

	console.log(results);

	return new Response(JSON.stringify(uploadedRecipe), {
		status: 200,
		headers: {
			'Content-Type': 'application/json',
		},
	});
}
