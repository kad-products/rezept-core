import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu } from '@/components/design-system';
import RecipeForm from '@/forms/recipe';
import AppLayout from '@/layouts/app';
import { getIngredients, getRecipeById } from '@/repositories';
import type { RecipeWithSections } from '@/types';

export default async function Pages__recipes__edit({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const recipeId = params.recipeId;
	const userId = ctx.user?.id;

	const recipe: RecipeWithSections | undefined = recipeId ? await getRecipeById(recipeId, ctx.logger) : undefined;
	const allIngredients = await getIngredients(ctx.logger);

	return (
		<AppLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx} leftNav="recipes">
			<Suspense fallback={<div>Loading recipe...</div>}>
				<h3>{recipe?.title || 'New Recipe'}</h3>
				{recipe && (
					<RzPopMenu
						permissions={ctx.permissions}
						items={[
							{
								requiredPermission: 'recipes:read',
								label: 'View',
								href: `/recipes/${recipe.id}`,
							},
						]}
					/>
				)}
				<RecipeForm recipe={recipe} allIngredients={allIngredients} currentUserId={userId} />
			</Suspense>
		</AppLayout>
	);
}
