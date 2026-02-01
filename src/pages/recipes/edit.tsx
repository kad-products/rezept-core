import type { RequestInfo } from 'rwsdk/worker';
import RecipeEdit from '@/components/server/RecipeEdit';
import StandardLayout from '@/layouts/standard';

export default function Pages__recipes__edit({ ctx, params }: RequestInfo) {
	return (
		<StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<RecipeEdit recipeId={params.recipeId} />
		</StandardLayout>
	);
}
