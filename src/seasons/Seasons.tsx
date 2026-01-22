import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';
import seasons from '@/data/seasons';

export default function Seasons({ ctx }: RequestInfo) {
  return (
    <StandardLayout currentBasePage="seasons" pageTitle="Seasons" ctx={ctx}>
      { seasons.map( ( season ) => (
        <section key={season.name}>
          <h3>{ season.name }</h3>
          <p>Location: { season.location }</p>
          <p>Months: { season.months.join( ', ' ) }</p>
          <p><a href={ `/seasons/${ season.id }` }>View Details</a></p>
        </section>
      ) ) }
    </StandardLayout>
  );
}
