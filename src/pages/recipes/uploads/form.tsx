import type { RequestInfo } from 'rwsdk/worker';
import RecipesNav from '@/components/navs/RecipesNav';
import RecipeUploadForm from '@/forms/recipe-upload';
import AppLayout from '@/layouts/app';
export default async function Pages__recipes__uploads__new({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	return (
		<AppLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx} leftNav={<RecipesNav userPerms={ctx.permissions} />}>
			<RecipeUploadForm />
		</AppLayout>
	);
}
