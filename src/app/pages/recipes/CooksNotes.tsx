import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/app/layouts/standard';
import recipes from '@/data/recipes';
import recipeCooksNotes from '@/data/recipe-cooks-notes';

export default function RecipeCooksNotes({ params }: RequestInfo) {

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
				Recipe Notes for { recipe.title }
			</h2>
      <nav aria-label="Recipe Navigation">
        <ul>
          <li><a href={ `/recipes/${ recipe.id }/cooks-notes/add` }>Add Cooks Note</a></li>
        </ul>
      </nav>
      {
        recipeCooksNotes ? 
        <ul>
          { recipeCooksNotes.map( ( cooksNote, index ) => (
            <li key={ index }>[{ cooksNote.dateCreated }] { cooksNote.notes }</li>
          ) ) }
        </ul>
        :
        <p>No cooks notes available for this recipe.</p>
      }
    </StandardLayout>
  );
}
