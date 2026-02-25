import { Suspense } from 'react';
import type { RequestInfo } from 'rwsdk/worker';
import Card from '@/components/client/Card';
import StandardLayout from '@/layouts/standard';
import { getRecipeImports } from '@/repositories/recipe-imports';
import { getRecipes } from '@/repositories/recipes';

export default async function Pages__recipes__listing({ ctx }: RequestInfo) {
	const recipes = await getRecipes();
	const recipeImports = await getRecipeImports();
	return (
		<StandardLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx}>
			<h3>Recipes</h3>
			<Suspense fallback={<div>Loading recipes...</div>}>
				{ctx.permissions?.includes('recipes:create') && <a href="/recipes/new">New Recipe</a>}

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
			<h3>Recipe Imports</h3>
			<Suspense fallback={<div>Loading recipe imports...</div>}>
				{ctx.permissions?.includes('recipes:import') && <a href="/recipes/import">Import Recipe</a>}
				<div className="recipe-imports-listing">
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Filename</th>
								<th>R2 Key</th>
								<th>MIME Type</th>
								<th>File Size</th>
								<th>Status</th>
								<th>Date Created</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{recipeImports.map(rI => {
								return (
									<tr key={rI.id}>
										<td>{rI.id}</td>
										<td>{rI.originalFilename}</td>
										<td>{rI.r2Key}</td>
										<td>{rI.mimeType}</td>
										<td>{rI.fileSize}</td>
										<td>{rI.status}</td>
										<td>{rI.createdAt}</td>
										<td>
											<a href={`/recipes/imports/${rI.id}`}>View</a>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</Suspense>
		</StandardLayout>
	);
}
