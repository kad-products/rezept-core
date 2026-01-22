import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';
import recipes from '@/data/recipes';

export default function Recipes({ ctx }: RequestInfo) {
  return (
    <StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
      { recipes.map( ( recipe ) => (
        <section key={recipe.id}>
          <h3>{ recipe.title }</h3>
          <p><a href={ `/recipes/${ recipe.id }` }>View Details</a></p>
        </section>
      ) ) }
    </StandardLayout>
  );
}
