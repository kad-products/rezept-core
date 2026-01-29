import type { RequestInfo } from 'rwsdk/worker';
import recipes from '@/data/recipes';
import StandardLayout from '@/layouts/standard';

export default function Recipes_Groceries({ params, ctx }: RequestInfo) {
	const recipe = recipes.find(s => s.id === params.id);

	if (!recipe) {
		return (
			<StandardLayout currentBasePage="recipes" pageTitle="Recipe Groceries" ctx={ctx}>
				<p>The recipe you are looking for does not exist.</p>
			</StandardLayout>
		);
	}

	return (
		<StandardLayout
			currentBasePage="recipes"
			pageTitle={`Grocery Shop for ${recipe.title}`}
			ctx={ctx}
		>
			<a href={`/recipes/${recipe.id}`}>← Back to Recipe</a>
			{recipe.ingredients ? (
				<ul>
					{recipe.ingredients.map(ingredient => (
						<li key={ingredient.id}>{ingredient.name}</li>
					))}
				</ul>
			) : (
				<p>No ingredients available for this recipe.</p>
			)}
		</StandardLayout>
	);
}
