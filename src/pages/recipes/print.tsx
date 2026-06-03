import { Fragment } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import PrintLayout from '@/layouts/print';
import { getRecipeById } from '@/repositories';

export default async function Pages__recipes__print({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const recipe = await getRecipeById(params.recipeId, ctx.logger);

	return (
		<PrintLayout pageTitle={recipe.title}>
			<p>Author: {recipe.author.username}</p>
			<p>Servings: {recipe.servings}</p>
			<p>Prep Time: {recipe.prepTime}</p>
			<p>Cook Time: {recipe.cookTime}</p>
			{recipe.description && <p>{recipe.description}</p>}
			{recipe.sections.map(s => (
				<Fragment key={s.id}>
					{recipe.sections.length > 1 && <h2>{s.title}</h2>}
					<h3>Ingredients</h3>
					<ul>
						{s.ingredients.map(ing => {
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
						{s.instructions.map(inst => (
							<li key={inst.id}>{inst.instruction}</li>
						))}
					</ol>
				</Fragment>
			))}
		</PrintLayout>
	);
}
