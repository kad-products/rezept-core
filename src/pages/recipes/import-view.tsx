import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import StandardLayout from '@/layouts/standard';
import { getRecipeImportById } from '@/repositories/recipe-imports';

export default async function Pages__recipes__importView({ ctx, params }: RequestInfo) {
	const recipeImportId = params.recipeImportId;
	const recipeImport = await getRecipeImportById(recipeImportId);

	if (!recipeImport) {
		return <p>Recipe import not found</p>;
	}

	return (
		<StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<Suspense fallback={<div>Loading recipe import...</div>}>
				<h3>{recipeImport.originalFilename}</h3>
				<div>
					<pre>{JSON.stringify(recipeImport, null, 4)}</pre>
				</div>
			</Suspense>
		</StandardLayout>
	);
}
