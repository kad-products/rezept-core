import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import RecipesTabs from '@/components/RecipesTabs';
import StandardLayout from '@/layouts/standard';
import { getApiKeysByUserId, getRecipes, getRecipeUploads } from '@/repositories';

export default async function Pages__recipes__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const userId = ctx.user?.id;
	const recipes = await getRecipes(ctx.logger);
	const recipeUploads = userId ? await getRecipeUploads(userId, ctx.logger) : [];
	const apiKeys = userId ? await getApiKeysByUserId(userId, ctx.logger) : [];
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
