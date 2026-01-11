import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/app/layouts/standard';
import groceryStores from '@/data/grocery-stores';

export default function GroceryStores({ ctx }: RequestInfo) {
  return (
    <StandardLayout currentBasePage="grocery-stores">
			<h2 className="page-title">
				Grocery Stores
			</h2>
      { groceryStores.map( ( store ) => (
        <section key={store.id}>
          <h3>{ store.name }</h3>
          <p><a href={ `/grocery-stores/${ store.id }` }>View Details</a></p>
        </section>
      ) ) }
    </StandardLayout>
  );
}
