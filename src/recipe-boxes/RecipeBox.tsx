import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';
import recipeBoxes from '@/data/recipe-boxes';

export default function RecipeBox({ params, ctx }: RequestInfo) {

  const recipeBox = recipeBoxes.find( ( s ) => s.id === params.id );
  
  if ( !recipeBox ) {
    return (
      <StandardLayout currentBasePage="recipe-boxes" ctx={ctx}>
        <h2 className="page-title">
          Recipe Box Not Found
        </h2>
        <p>The recipe box you are looking for does not exist.</p>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout currentBasePage="recipe-boxes" ctx={ctx}>
      <a href="/recipe-boxes">← All Recipe Boxes</a>
			<h2 className="page-title">
				Recipe Box: { recipeBox.name }
			</h2>
    </StandardLayout>
  );
}
