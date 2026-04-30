import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import StandardLayout from '@/layouts/standard';
import { getRecipeUploadById } from '@/repositories/recipe-uploads';

export default async function Pages__recipes__upload_view({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const recipeUploadId = params.recipeUploadId;
	const recipeUpload = await getRecipeUploadById(recipeUploadId, ctx.logger);

	if (!recipeUpload) {
		return <p>Recipe upload not found</p>;
	}

	return (
		<StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<Suspense fallback={<div>Loading recipe upload...</div>}>
				<h3>{recipeUpload.originalFilename}</h3>
				<div>
					<pre>{JSON.stringify(recipeUpload, null, 4)}</pre>
				</div>
			</Suspense>
		</StandardLayout>
	);
}
