import type { RequestInfo } from 'rwsdk/worker';
import RecipeUploadForm from '@/forms/recipe-upload';
import AppLayout from '@/layouts/app';

export default async function Pages__recipes__upload({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	return (
		<AppLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<RecipeUploadForm />
		</AppLayout>
	);
}
