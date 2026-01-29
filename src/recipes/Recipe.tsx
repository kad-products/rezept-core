import type { RequestInfo } from 'rwsdk/worker';
import recipes from '@/data/recipes';
import StandardLayout from '@/layouts/standard';

export default function Recipe({ params, ctx }: RequestInfo) {
	const recipe = recipes.find(s => s.id === params.id);

	if (!recipe) {
		return (
			<StandardLayout currentBasePage="recipes" pageTitle="Recipe" ctx={ctx}>
				<p>The recipe you are looking for does not exist.</p>
			</StandardLayout>
		);
	}

	return (
		<StandardLayout currentBasePage="recipes" pageTitle={`Recipe: ${recipe.title}`} ctx={ctx}>
			<a href="/recipes">← All Recipes</a>
			<nav aria-label="Recipe Navigation">
				<ul>
					<li>
						<a href={`/recipes/${recipe.id}#instructions`}>Instructions</a>
					</li>
					<li>
						<a href={`/recipes/${recipe.id}#ingredients`}>Ingredients</a>
					</li>
					<li>
						<a href={`/recipes/${recipe.id}/add`}>Add to Recipe Box</a>
					</li>
					<li>
						<a href={`/recipes/${recipe.id}/feedback`}>Add Feedback</a>
					</li>
					<li>
						<a href={`/recipes/${recipe.id}/cooks-notes`}>View Cooks Notes</a>
					</li>
					<li>
						<a href={`/recipes/${recipe.id}/cooks-notes/add`}>Add Cooks Note</a>
					</li>
				</ul>
			</nav>
			<h3 id="instructions">Instructions</h3>
			<ol>
				{recipe.instructions.map(step => (
					<li key={step}>{step}</li>
				))}
			</ol>
			<h3 id="ingredients">Ingredients</h3>
			<ul>
				{recipe.ingredients.map(ingredient => (
					<li key={ingredient.id}>{ingredient.name}</li>
				))}
			</ul>
		</StandardLayout>
	);
}
