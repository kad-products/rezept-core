import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/app/layouts/standard';
import recipes from '@/data/recipes';

export default function Recipe({ params }: RequestInfo) {

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
      <a href="/recipes">← All Recipes</a>
			<h2 className="page-title">
				Recipe: { recipe.title }
			</h2>
      <nav aria-label="Recipe Navigation">
        <ul>
          <li><a href={ `/recipes/${ recipe.id }#instructions` }>Instructions</a></li>
          <li><a href={ `/recipes/${ recipe.id }#ingredients` }>Ingredients</a></li>
          <li><a href={ `/recipes/${ recipe.id }/add` }>Add to Recipe Box</a></li>
          <li><a href={ `/recipes/${ recipe.id }/feedback` }>Add Feedback</a></li>
          <li><a href={ `/recipes/${ recipe.id }/cooks-notes` }>View Cooks Notes</a></li>
          <li><a href={ `/recipes/${ recipe.id }/cooks-notes/add` }>Add Cooks Note</a></li>
        </ul>
      </nav>
      <h3 id="instructions">Instructions</h3>
      <ol>
        { recipe.instructions.map( ( step, index ) => (
          <li key={ index }>{ step }</li>
        ) ) }
      </ol>
      <h3 id="ingredients">Ingredients</h3>
      <ul>
        { recipe.ingredients.map( ( ingredient, index ) => (
          <li key={ index }>{ ingredient.name }</li>
        ) ) }
      </ul>
    </StandardLayout>
  );
}
