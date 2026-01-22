import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';
import recipeBoxes from '@/data/recipe-boxes';

export default function RecipeBoxes({ ctx }: RequestInfo) {
  return (
    <StandardLayout currentBasePage="recipe-boxes" pageTitle="Recipe Boxes" ctx={ctx}>
      { recipeBoxes.map( ( box ) => (
        <section key={box.id}>
          <h3>{ box.name }</h3>
          <a href={ `/recipe-boxes/${ box.id }` }>View Recipe Box</a>
        </section>
      ) ) }
    </StandardLayout>
  );
}
