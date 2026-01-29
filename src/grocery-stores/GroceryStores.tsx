import type { RequestInfo } from 'rwsdk/worker';
import groceryStores from '@/data/grocery-stores';
import StandardLayout from '@/layouts/standard';

export default function GroceryStores({ ctx }: RequestInfo) {
	return (
		<StandardLayout currentBasePage="grocery-stores" pageTitle="Grocery Stores" ctx={ctx}>
			{groceryStores.map(store => (
				<section key={store.id}>
					<h3>{store.name}</h3>
					<p>
						<a href={`/grocery-stores/${store.id}`}>View Details</a>
					</p>
				</section>
			))}
		</StandardLayout>
	);
}
