import { Fragment, Suspense } from 'react';
import { getIngredientsByRecipeSectionId } from '@/repositories/recipe-ingredients';
import { getInstructionsByRecipeSectionId } from '@/repositories/recipe-instructions';
import { getSectionsByRecipeId } from '@/repositories/recipe-sections';
import { getRecipeById } from '@/repositories/recipes';
import { getUserById } from '@/repositories/users';

export default async function RecipeView({ recipeId }: { recipeId: string }) {
	const recipe = await getRecipeById(recipeId);

	if (!recipe) {
		return null;
	}

	const author = await getUserById(recipe.authorId);
	const sections = await getSectionsByRecipeId(recipeId);
	const instructions = await Promise.all(sections.map(async s => await getInstructionsByRecipeSectionId(s.id)));
	const ingredients = await Promise.all(sections.map(async s => await getIngredientsByRecipeSectionId(s.id)));

	return (
		<Suspense fallback={<div>Loading recipe...</div>}>
			<h3>{recipe.title}</h3>
			<nav className="in-page-nav">
				<a href={`/recipes/${recipe.id}/edit`}>Edit</a>
			</nav>
			<p>Author: {author?.username}</p>
			<p>Source: {recipe.source}</p>
			<p>Servings: {recipe.servings}</p>
			<p>Prep Time: {recipe.prepTime}</p>
			<p>Cook Time: {recipe.cookTime}</p>
			<p>{recipe.description}</p>
			{sections.map((s, sectionIdx) => {
				const sectionInstructions = instructions[sectionIdx];
				const sectionIngredients = ingredients[sectionIdx];
				return (
					<Fragment key={s.id}>
						{sections.length > 1 && <h3>{s.title}</h3>}
						<h4>Instructions</h4>
						<ol>
							{sectionInstructions.map(inst => {
								return <li key={inst.id}>{inst.instruction}</li>;
							})}
						</ol>
						<h4>Ingredients</h4>
						<ul>
							{sectionIngredients.map(ing => {
								return (
									<li key={ing.id}>
										{ing.quantity} {ing.modifier}
										{ing.ingredientId}, {ing.preparation}
									</li>
								);
							})}
						</ul>
					</Fragment>
				);
			})}
		</Suspense>
	);
}
