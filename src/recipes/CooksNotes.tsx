import type { RequestInfo } from 'rwsdk/worker';
import recipeCooksNotes from '@/data/recipe-cooks-notes';
import recipes from '@/data/recipes';
import StandardLayout from '@/layouts/standard';

export default function RecipeCooksNotes({ params, ctx }: RequestInfo) {
	const recipe = recipes.find(s => s.id === params.id);

	if (!recipe) {
		return (
			<StandardLayout currentBasePage="recipes" pageTitle="Recipe Cooks Notes" ctx={ctx}>
				<p>The recipe you are looking for does not exist.</p>
			</StandardLayout>
		);
	}

	return (
		<StandardLayout
			currentBasePage="recipes"
			pageTitle={`Recipe Notes for ${recipe.title}`}
			ctx={ctx}
		>
			<a href={`/recipes/${recipe.id}`}>← Back to Recipe</a>
			<nav aria-label="Recipe Navigation">
				<ul>
					<li>
						<a href={`/recipes/${recipe.id}/cooks-notes/add`}>Add Cooks Note</a>
					</li>
				</ul>
			</nav>
			{recipeCooksNotes ? (
				<ul>
					{recipeCooksNotes.map(cooksNote => (
						<li key={cooksNote.id}>
							[{cooksNote.dateCreated}] {cooksNote.notes}
						</li>
					))}
				</ul>
			) : (
				<p>No cooks notes available for this recipe.</p>
			)}
		</StandardLayout>
	);
}
