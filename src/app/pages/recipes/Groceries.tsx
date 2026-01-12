import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';
import recipes from '@/data/recipes';

export default function Recipes_Groceries({ params, ctx }: RequestInfo) {

    const recipe = recipes.find((s) => s.id === params.id);

    if (!recipe) {
        return (
            <StandardLayout currentBasePage="recipes" ctx={ctx}>
                <h2 className="page-title">
                    Recipe Not Found
                </h2>
                <p>The recipe you are looking for does not exist.</p>
            </StandardLayout>
        );
    }

    return (
        <StandardLayout currentBasePage="recipes" ctx={ctx}>
            <a href={`/recipes/${recipe.id}`}>← Back to Recipe</a>
            <h2 className="page-title">
                Grocery Shop for {recipe.title}
            </h2>
            {
                recipe.ingredients ?
                    <ul>
                        {recipe.ingredients.map((ingredient, index) => (
                            <li key={index}>{ingredient.name}</li>
                        ))}
                    </ul>
                    :
                    <p>No ingredients available for this recipe.</p>
            }
        </StandardLayout>
    );
}
