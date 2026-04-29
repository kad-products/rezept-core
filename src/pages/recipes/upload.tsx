import type { RequestInfo } from 'rwsdk/worker';
import RecipeUpload from '@/forms/recipe-upload';
import StandardLayout from '@/layouts/standard';

export default async function Pages__recipes__upload({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	return (
		<StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<RecipeUpload />
		</StandardLayout>
	);
}
