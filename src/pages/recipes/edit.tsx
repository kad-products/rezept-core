import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import Recipe from '@/forms/recipe';
import AppLayout from '@/layouts/app';
import { getIngredients, getRecipeById } from '@/repositories';
import type { RecipeWithSections } from '@/types';

export default async function Pages__recipes__edit({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const recipeId = params.recipeId;
	const userId = ctx.user?.id;

	const recipe: RecipeWithSections | undefined = recipeId ? await getRecipeById(recipeId, ctx.logger) : undefined;
	const allIngredients = await getIngredients(ctx.logger);

	return (
		<AppLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<Suspense fallback={<div>Loading recipe...</div>}>
				<h3>{recipe?.title || 'New Recipe'}</h3>
				{recipe && (
					<nav className="in-page-nav">
						<a href={`/recipes/${recipe.id}`}>View</a>
					</nav>
				)}
				<Recipe recipe={recipe} allIngredients={allIngredients} currentUserId={userId} />
			</Suspense>
		</AppLayout>
	);
}
