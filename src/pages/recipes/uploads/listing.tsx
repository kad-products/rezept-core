import type { RequestInfo } from 'rwsdk/worker';
import RecipesNav from '@/components/navs/RecipesNav';
import RecipeUploadTable from '@/components/tables/RecipeUploadsTable';
import AppLayout from '@/layouts/app';
import { getRecipeUploads } from '@/repositories';

export default async function Pages__recipes__uploads__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const userId = ctx.user?.id;
	const recipeUploads = userId ? await getRecipeUploads(userId, ctx.logger) : [];
	return (
		<AppLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx} leftNav={<RecipesNav userPerms={ctx.permissions} />}>
			{ctx.permissions?.includes('recipes:upload') && <a href="/recipes/uploads/new">Upload Recipe</a>}
			<RecipeUploadTable recipeUploads={recipeUploads} />
		</AppLayout>
	);
}
