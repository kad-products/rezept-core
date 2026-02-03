import { Suspense } from 'react';
import Recipe from '@/forms/recipe';
import { getIngredients } from '@/repositories/ingredients';
import { getIngredientsByRecipeSectionId } from '@/repositories/recipe-ingredients';
import { getInstructionsByRecipeSectionId } from '@/repositories/recipe-instructions';
import { getSectionsByRecipeId } from '@/repositories/recipe-sections';
import { getRecipeById } from '@/repositories/recipes';

export default async function RecipeEdit({ recipeId }: { recipeId: string }) {
	const recipe = await getRecipeById(recipeId);

	if (!recipe) {
		return null;
	}

	const sections = await getSectionsByRecipeId(recipeId);
	const allIngredients = await getIngredients();
	const instructions = await Promise.all(
		sections.map(async s => await getInstructionsByRecipeSectionId(s.id)),
	);
	const ingredients = await Promise.all(
		sections.map(async s => await getIngredientsByRecipeSectionId(s.id)),
	);

	return (
		<Suspense fallback={<div>Loading recipe...</div>}>
			<h3>{recipe.title}</h3>
			<nav className="in-page-nav">
				<a href={`/recipes/${recipe.id}`}>View</a>
			</nav>
			<Recipe
				recipe={recipe}
				sections={sections}
				instructions={instructions}
				recipeIngredients={ingredients}
				allIngredients={allIngredients}
			/>
		</Suspense>
	);
}
