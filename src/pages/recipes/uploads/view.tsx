import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import AppLayout from '@/layouts/app';
import { getRecipeUploadById } from '@/repositories';

export default async function Pages__recipes__uploads__view({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const recipeUploadId = params.recipeUploadId;
	const recipeUpload = await getRecipeUploadById(recipeUploadId, ctx.logger);

	return (
		<AppLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx} leftNav="recipes">
			<Suspense fallback={<div>Loading recipe upload...</div>}>
				<h3>{recipeUpload.originalFilename}</h3>
				<div>
					<pre>{JSON.stringify(recipeUpload, null, 4)}</pre>
				</div>
			</Suspense>
		</AppLayout>
	);
}
