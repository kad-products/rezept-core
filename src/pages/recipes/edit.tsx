import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import Recipe from '@/forms/recipe';
import AppLayout from '@/layouts/app';
import {
	getIngredients,
	getIngredientsByRecipeSectionId,
	getInstructionsByRecipeSectionId,
	getRecipeById,
	getSectionsByRecipeId,
} from '@/repositories';
import type { RecipeWithSections } from '@/types';

export default async function Pages__recipes__edit({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const recipeId = params.recipeId;
	const userId = ctx.user?.id;
	let recipe: RecipeWithSections | undefined;

	if (!recipeId) {
		recipe = undefined;
	} else {
		const recipeBase = await getRecipeById(recipeId, ctx.logger);
		if (!recipeBase) {
			return <p>Recipe not found</p>;
		}
		const sections = await getSectionsByRecipeId(recipeId, ctx.logger);
		recipe = {
			...recipeBase,
			sections: await Promise.all(
				sections.map(async s => {
					return {
						...s,
						ingredients: await getIngredientsByRecipeSectionId(s.id, ctx.logger),
						instructions: await getInstructionsByRecipeSectionId(s.id, ctx.logger),
					};
				}),
			),
		};
	}

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
