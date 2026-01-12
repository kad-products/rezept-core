import { RequestInfo } from "rwsdk/worker";

import StandardLayout from '@/layouts/standard';
import groceryStores from '@/data/grocery-stores';

export default function GroceryStore({ params, ctx }: RequestInfo) {

  const groceryStore = groceryStores.find( ( s ) => s.id === params.id );
  
  if ( !groceryStore ) {
    return (
      <StandardLayout currentBasePage="grocery-stores" ctx={ctx}>
        <h2 className="page-title">
          Grocery Store Not Found
        </h2>
        <p>The grocery store you are looking for does not exist.</p>
      </StandardLayout>
    );
  }

  return (
    <StandardLayout currentBasePage="grocery-stores" ctx={ctx}>
      <a href="/grocery-stores">← All Stores</a>
			<h2 className="page-title">
				Grocery Store: { groceryStore.name }
			</h2>
      <h3>Aisles</h3>
      <ul>
        { groceryStore.aisles.map( ( aisle, index ) => (
          <li key={ index }>
            { aisle.name }
            <ul>
              { aisle.categories.map( ( category, catIndex ) => (
                <li key={ catIndex }>{ category }</li>
              ) ) }
            </ul>
          </li>
        ) ) }
      </ul>
    </StandardLayout>
  );
}
