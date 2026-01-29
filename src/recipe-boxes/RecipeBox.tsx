import type { RequestInfo } from 'rwsdk/worker';
import recipeBoxes from '@/data/recipe-boxes';
import StandardLayout from '@/layouts/standard';

export default function RecipeBox({ params, ctx }: RequestInfo) {
	const recipeBox = recipeBoxes.find(s => s.id === params.id);

	if (!recipeBox) {
		return (
			<StandardLayout currentBasePage="recipe-boxes" pageTitle="Recipe Boxes" ctx={ctx}>
				<p>The recipe box you are looking for does not exist.</p>
			</StandardLayout>
		);
	}

	return (
		<StandardLayout
			currentBasePage="recipe-boxes"
			pageTitle={`Recipe Box: ${recipeBox.name}`}
			ctx={ctx}
		>
			<a href="/recipe-boxes">← All Recipe Boxes</a>
		</StandardLayout>
	);
}
