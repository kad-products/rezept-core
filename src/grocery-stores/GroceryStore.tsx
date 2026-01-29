import type { RequestInfo } from 'rwsdk/worker';
import groceryStores from '@/data/grocery-stores';
import StandardLayout from '@/layouts/standard';

export default function GroceryStore({ params, ctx }: RequestInfo) {
	const groceryStore = groceryStores.find(s => s.id === params.id);

	if (!groceryStore) {
		return (
			<StandardLayout currentBasePage="grocery-stores" pageTitle="Grocery Stores" ctx={ctx}>
				<p>The grocery store you are looking for does not exist.</p>
			</StandardLayout>
		);
	}

	return (
		<StandardLayout
			currentBasePage="grocery-stores"
			pageTitle={`Grocery Store: ${groceryStore.name}`}
			ctx={ctx}
		>
			<a href="/grocery-stores">← All Stores</a>
			<h3>Aisles</h3>
			<ul>
				{groceryStore.aisles.map(aisle => (
					<li key={aisle.name}>
						{aisle.name}
						<ul>
							{aisle.categories.map(category => (
								<li key={category}>{category}</li>
							))}
						</ul>
					</li>
				))}
			</ul>
		</StandardLayout>
	);
}
