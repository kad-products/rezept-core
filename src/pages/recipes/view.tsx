import type { RequestInfo } from 'rwsdk/worker';
import RecipeView from '@/components/server/RecipeView';
import StandardLayout from '@/layouts/standard';

export default function Pages__recipes__view({ ctx, params }: RequestInfo) {
	return (
		<StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<RecipeView recipeId={params.recipeId} />
		</StandardLayout>
	);
}
