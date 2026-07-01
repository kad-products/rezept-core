import type { RequestInfo } from 'rwsdk/worker';
import { RzLink } from '@/components/design-system';
import RecipeUploadTable from '@/components/tables/RecipeUploadsTable';
import AppLayout from '@/layouts/app';
import { getRecipeUploads } from '@/repositories';

export default async function Pages__recipes__uploads__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const userId = ctx.user?.id;
	const recipeUploads = userId ? await getRecipeUploads(userId, ctx.logger) : [];
	return (
		<AppLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx} leftNav="recipes">
			<RzLink
				userPermissions={ctx.permissions}
				requiredPermission="recipes:upload"
				label="Upload Recipe"
				href="/recipes/uploads/new"
			/>
			<RecipeUploadTable recipeUploads={recipeUploads} userPermissions={ctx.permissions} />
		</AppLayout>
	);
}
