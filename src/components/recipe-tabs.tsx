'use client';
import { Tabs } from 'radix-ui';
import Card from '@/components/client/Card';
import type { Recipe, RecipeImport } from '@/types';

export default function RecipesTabs({
	recipes,
	recipeImports,
	permissions = [],
}: {
	recipes: Recipe[];
	recipeImports: RecipeImport[];
	permissions?: string[];
}) {
	return (
		<Tabs.Root className="rz-tabs-root" defaultValue="listing">
			<Tabs.List className="rz-tabs-list" aria-label="Choose your recipe type">
				<Tabs.Trigger className="rz-tabs-trigger" value="listing">
					Recipes
				</Tabs.Trigger>
				<Tabs.Trigger className="rz-tabs-trigger" value="imports">
					Imports
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content className="rz-tabs-content" value="listing">
				{permissions?.includes('recipes:create') && <a href="/recipes/new">New Recipe</a>}

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
			</Tabs.Content>
			<Tabs.Content className="rz-tabs-content" value="imports">
				{permissions?.includes('recipes:import') && <a href="/recipes/import">Import Recipe</a>}
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
			</Tabs.Content>
		</Tabs.Root>
	);
}
