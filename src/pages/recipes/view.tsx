import { Fragment, Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import StandardLayout from '@/layouts/standard';
import {
	getImageById,
	getIngredientsByRecipeSectionId,
	getInstructionsByRecipeSectionId,
	getRecipeById,
	getSectionsByRecipeId,
	getUserById,
} from '@/repositories';

export default async function Pages__recipes__view({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const recipeId = params.recipeId;
	const recipe = await getRecipeById(recipeId, ctx.logger);
	const author = await getUserById(recipe.authorId, ctx.logger);
	const sections = await getSectionsByRecipeId(recipeId, ctx.logger);
	const instructions = await Promise.all(sections.map(async s => await getInstructionsByRecipeSectionId(s.id, ctx.logger)));
	const ingredients = await Promise.all(sections.map(async s => await getIngredientsByRecipeSectionId(s.id, ctx.logger)));

	return (
		<StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<Suspense fallback={<div>Loading recipe...</div>}>
				<h3>{recipe.title}</h3>
				{ctx.permissions?.includes('recipes:update') && (
					<nav className="in-page-nav">
						<a href={`/recipes/${recipe.id}/edit`}>Edit</a>
					</nav>
				)}
				<div className="recipe-cover-image">
					{recipe.coverImageId ? (
						<img src={`/api/images/${recipe.coverImageId}`} alt={`${recipe.title} cover`} />
					) : (
						<div>No cover image</div>
					)}
				</div>
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
									if (ing.raw) {
										return <li key={ing.id}>{ing.raw}</li>;
									}
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
		</StandardLayout>
	);
}
