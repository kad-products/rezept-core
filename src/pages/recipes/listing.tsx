import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import RecipesTabs from '@/components/recipe-tabs';
import StandardLayout from '@/layouts/standard';
import { getApiKeysByUserId } from '@/repositories/api-keys';
import { getRecipeUploads } from '@/repositories/recipe-uploads';
import { getRecipes } from '@/repositories/recipes';

export default async function Pages__recipes__listing({ ctx }: RequestInfo) {
	const userId = ctx.user?.id;
	const recipes = await getRecipes();
	const recipeUploads = await getRecipeUploads();
	const apiKeys = userId ? await getApiKeysByUserId(userId) : [];
	return (
		<StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<Suspense fallback={<div>Loading recipes...</div>}>
				<RecipesTabs
					recipes={recipes}
					recipeUploads={recipeUploads}
					permissions={ctx.permissions}
					apiKeys={apiKeys}
					userId={userId}
				/>
			</Suspense>
		</StandardLayout>
	);
}
