import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';
import recipes from '@/data/recipes';

export default function RecipeCooksNoteAdd({ params, ctx }: RequestInfo) {

  const recipe = recipes.find( ( s ) => s.id === params.id );
  
  if ( !recipe ) {
    return (
      <StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
        <p>The recipe you are looking for does not exist.</p>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout currentBasePage="recipes" pageTitle={ `Provide Cooks Notes for ${ recipe.title }` } ctx={ctx}>
      <a href={ `/recipes/${ recipe.id }` }>← Back to Recipe</a>
      <form method="POST" action={ `/api/recipes/${ recipe.id }/cooks-notes` }>
        <input type="hidden" name="recipeId" value={ recipe.id } />
        <label htmlFor="cooksNotesText">Your Cooks Notes:</label>
        <textarea id="cooksNotesText" name="cooksNotesText" rows={5} required></textarea>
        <button type="submit">Submit Feedback</button>
      </form>
    </StandardLayout>
  );
}
