import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/app/layouts/standard';
import recipes from '@/data/recipes';

export default function Recipes({ ctx }: RequestInfo) {
  return (
    <StandardLayout currentBasePage="recipes">
			<h2 className="page-title">
				Recipes
			</h2>
      { recipes.map( ( recipe ) => (
        <section key={recipe.id}>
          <h3>{ recipe.title }</h3>
          <p><a href={ `/recipes/${ recipe.id }` }>View Details</a></p>
        </section>
      ) ) }
    </StandardLayout>
  );
}
