import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import Card from '@/components/client/Card';
import StandardLayout from '@/layouts/standard';
import { getRecipes } from '@/repositories/recipes';

export default async function Pages__recipes__listing({ ctx }: RequestInfo) {
	const recipes = await getRecipes();
	return (
		<StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<Suspense fallback={<div>Loading recipes...</div>}>
				{ctx.permissions?.includes('recipes:create') && <a href="/recipes/new">New Recipe</a>}
				{ctx.permissions?.includes('recipes:import') && <a href="/recipes/import">Import Recipe</a>}

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
		</StandardLayout>
	);
}
