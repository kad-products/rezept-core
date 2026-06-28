import { Fragment, Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu } from '@/components/design-system';
import AppLayout from '@/layouts/app';
import { getRecipeById } from '@/repositories';

export default async function Pages__recipes__view({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const recipe = await getRecipeById(params.recipeId, ctx.logger);

	return (
		<AppLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx} leftNav="recipes">
			<Suspense fallback={<div>Loading recipe...</div>}>
				<h3>{recipe.title}</h3>
				<RzPopMenu
					permissions={ctx.permissions}
					items={[
						{
							requiredPermission: 'recipes:update',
							label: 'Edit',
							href: `/recipes/${recipe.id}/edit`,
						},
					]}
				/>
				<div className="recipe-cover-image">
					{recipe.coverImageId ? (
						<img src={`/api/images/${recipe.coverImageId}`} alt={`${recipe.title} cover`} />
					) : (
						<div>No cover image</div>
					)}
				</div>
				<p>Author: {recipe.author.username}</p>
				<p>Source: {recipe.source}</p>
				<p>Servings: {recipe.servings}</p>
				<p>Prep Time: {recipe.prepTime}</p>
				<p>Cook Time: {recipe.cookTime}</p>
				<p>{recipe.description}</p>
				{recipe.sections.map(s => (
					<Fragment key={s.id}>
						{recipe.sections.length > 1 && <h3>{s.title}</h3>}
						<h4>Instructions</h4>
						<ol>
							{s.instructions.map(inst => (
								<li key={inst.id}>{inst.instruction}</li>
							))}
						</ol>
						<h4>Ingredients</h4>
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
					</Fragment>
				))}
			</Suspense>
		</AppLayout>
	);
}
