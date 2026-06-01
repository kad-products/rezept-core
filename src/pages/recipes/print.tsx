import { Fragment } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import PrintLayout from '@/layouts/print';
import {
	getIngredientsByRecipeSectionId,
	getInstructionsByRecipeSectionId,
	getRecipeById,
	getSectionsByRecipeId,
} from '@/repositories';

export default async function Pages__recipes__print({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const recipeId = params.recipeId;
	const recipe = await getRecipeById(recipeId, ctx.logger);
	const sections = await getSectionsByRecipeId(recipeId, ctx.logger);
	const instructions = await Promise.all(sections.map(s => getInstructionsByRecipeSectionId(s.id, ctx.logger)));
	const ingredients = await Promise.all(sections.map(s => getIngredientsByRecipeSectionId(s.id, ctx.logger)));

	return (
		<PrintLayout pageTitle={recipe.title}>
			<p>Servings: {recipe.servings}</p>
			<p>Prep Time: {recipe.prepTime}</p>
			<p>Cook Time: {recipe.cookTime}</p>
			{recipe.description && <p>{recipe.description}</p>}
			{sections.map((s, sectionIdx) => {
				const sectionInstructions = instructions[sectionIdx];
				const sectionIngredients = ingredients[sectionIdx];
				return (
					<Fragment key={s.id}>
						{sections.length > 1 && <h2>{s.title}</h2>}
						<h3>Ingredients</h3>
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
						<h3>Instructions</h3>
						<ol>
							{sectionInstructions.map(inst => (
								<li key={inst.id}>{inst.instruction}</li>
							))}
						</ol>
					</Fragment>
				);
			})}
		</PrintLayout>
	);
}
