import { Suspense } from 'react';
import { getRecipes } from '@/repositories/recipes';

import Card from '../client/Card';

export default async function RecipeListing() {
	const recipes = await getRecipes();

	return (
		<Suspense fallback={<div>Loading recipes...</div>}>
			<div className="recipes-listing">
				{recipes.map(r => {
					return (
						<Card
							key={r.id}
							title={r.title}
							body={r.description || ''}
							actions={[
								{
									href: `/recipes/${r.id}`,
									text: `View`,
								},
								{
									href: `/recipes/${r.id}/favorite`,
									text: `Favorite`,
								},
							]}
						/>
					);
				})}
			</div>
		</Suspense>
	);
}
