import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/app/layouts/standard';
import recipes from '@/data/recipes';
import recipeBoxes from '@/data/recipe-boxes';

export default function RecipeAdd({ params }: RequestInfo) {

  const recipe = recipes.find( ( s ) => s.id === params.id );
  
  if ( !recipe ) {
    return (
      <StandardLayout currentBasePage="recipes">
        <h2 className="page-title">
          Recipe Not Found
        </h2>
        <p>The recipe you are looking for does not exist.</p>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout currentBasePage="recipes">
      <a href={ `/recipes/${ recipe.id }` }>← Back to Recipe</a>
			<h2 className="page-title">
				Add { recipe.title } to Recipe Box
			</h2>
      <form method="POST" action={ `/api/recipe-boxes/add-recipe` }>
        <input type="hidden" name="recipeId" value={ recipe.id } />
        <label htmlFor="recipeBoxSelect">Select Recipe Box:</label>
        <select id="recipeBoxSelect" name="recipeBoxId" required>
          <option>[ Please Select ]</option>
          { recipeBoxes.map( ( box ) => (
            <option key={ box.id } value={ box.id }>{ box.name }</option>
          ) ) }
        </select>
        <button type="submit">Add to Recipe Box</button>
      </form>
    </StandardLayout>
  );
}
