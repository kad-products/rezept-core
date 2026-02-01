import { Suspense } from 'react';
import Recipe from '@/forms/recipe';
import { getIngredientsByRecipeSectionId } from '@/repositories/recipe-ingredients';
import { getInstructionsByRecipeSectionId } from '@/repositories/recipe-instructions';
import { getSectionsByRecipeId } from '@/repositories/recipe-sections';
import { getRecipeById } from '@/repositories/recipes';
import { getUserById } from '@/repositories/users';

export default async function RecipeEdit({ recipeId }: { recipeId: string }) {
	const recipe = await getRecipeById(recipeId);

	if (!recipe) {
		return null;
	}

	const author = await getUserById(recipe.authorId);
	const sections = await getSectionsByRecipeId(recipeId);
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
				<a href={`/recipes/${recipe.id}/edit`}>Edit</a>
			</nav>
			<Recipe recipe={recipe} />
		</Suspense>
	);
}
