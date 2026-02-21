import { Suspense } from 'react';
import { requestInfo } from 'rwsdk/worker';
import Recipe from '@/forms/recipe';
import { getIngredients } from '@/repositories/ingredients';
import { getIngredientsByRecipeSectionId } from '@/repositories/recipe-ingredients';
import { getInstructionsByRecipeSectionId } from '@/repositories/recipe-instructions';
import { getSectionsByRecipeId } from '@/repositories/recipe-sections';
import { getRecipeById } from '@/repositories/recipes';
import type { RecipeWithSections } from '@/types';

export default async function RecipeEdit({ recipeId }: { recipeId: string }) {
	const userId = requestInfo.ctx.user?.id;
	let recipe: RecipeWithSections | undefined;

	if (!recipeId) {
		recipe = undefined;
	} else {
		const recipeBase = await getRecipeById(recipeId);
		if (!recipeBase) {
			return null;
		}
		const sections = await getSectionsByRecipeId(recipeId);
		recipe = {
			...recipeBase,
			sections: await Promise.all(
				sections.map(async s => {
					return {
						...s,
						ingredients: await getIngredientsByRecipeSectionId(s.id),
						instructions: await getInstructionsByRecipeSectionId(s.id),
					};
				}),
			),
		};
	}

	const allIngredients = await getIngredients();
	// const instructions = await Promise.all(sections.map(async s => await getInstructionsByRecipeSectionId(s.id)));
	// const ingredients = await Promise.all(sections.map(async s => await getIngredientsByRecipeSectionId(s.id)));

	return (
		<Suspense fallback={<div>Loading recipe...</div>}>
			<h3>{recipe?.title || 'New Recipe'}</h3>
			{recipe && (
				<nav className="in-page-nav">
					<a href={`/recipes/${recipe.id}`}>View</a>
				</nav>
			)}
			<Recipe recipe={recipe} allIngredients={allIngredients} currentUserId={userId} />
		</Suspense>
	);
}
