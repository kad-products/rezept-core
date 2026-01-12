import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';
import seasons from '@/data/seasons';

export default function Season({ params, ctx }: RequestInfo) {

  const season = seasons.find( ( s ) => s.id === params.id );
  
  if ( !season ) {
    return (
      <StandardLayout currentBasePage="seasons" ctx={ctx}>
        <h2 className="page-title">
          Season Not Found
        </h2>
        <p>The season you are looking for does not exist.</p>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout currentBasePage="seasons" ctx={ctx}>
      <a href="/seasons">← All Seasons</a>
			<h2 className="page-title">
				Season: { season.name }
			</h2>
      <p><span>Location: { season.location }</span></p>
      <p><span>Months: { season.months.join( ', ' ) }</span></p>
      <p><span>ID: { season.id }</span></p>
      <h3>Ingredients:</h3>
      <ul>
        { season.ingredients.map( ( ingredient ) => (
          <li key={ingredient.id}>{ ingredient.name }</li>
        ) ) }
      </ul>
    </StandardLayout>
  );
}
