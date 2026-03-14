import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import RecipesTabs from '@/components/recipe-tabs';
import StandardLayout from '@/layouts/standard';
import { getRecipeImports } from '@/repositories/recipe-imports';
import { getRecipes } from '@/repositories/recipes';

export default async function Pages__recipes__listing({ ctx }: RequestInfo) {
	const recipes = await getRecipes();
	const recipeImports = await getRecipeImports();
	return (
		<StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<Suspense fallback={<div>Loading recipes...</div>}>
				<RecipesTabs recipes={recipes} recipeImports={recipeImports} permissions={ctx.permissions} />
			</Suspense>
		</StandardLayout>
	);
}
