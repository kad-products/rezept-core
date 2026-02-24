import type { RequestInfo } from 'rwsdk/worker';
import RecipeImport from '@/forms/recipe-import';
import StandardLayout from '@/layouts/standard';

export default async function Pages__recipes__import({ ctx }: RequestInfo) {
	return (
		<StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<RecipeImport />
		</StandardLayout>
	);
}
