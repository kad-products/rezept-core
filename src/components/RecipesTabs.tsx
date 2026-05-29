'use client';
import { Tabs } from 'radix-ui';
import RzCard from '@/components/RzCard';
import type { ApiKeyDBRead, RecipeDBRead, RecipeUploadDBRead } from '@/types';
import BookmarkletInstall from './BookmarkletInstall';

export default function RecipesTabs({
	apiKeys,
	userId,
	recipes,
	recipeUploads,
	permissions = [],
}: {
	apiKeys: ApiKeyDBRead[];
	userId: string | undefined;
	recipes: RecipeDBRead[];
	recipeUploads: RecipeUploadDBRead[];
	permissions?: string[];
}): React.ReactNode {
	return (
		<Tabs.Root className="rz-tabs-root" defaultValue="listing">
			<Tabs.List className="rz-tabs-list" aria-label="Choose your recipe type">
				<Tabs.Trigger className="rz-tabs-trigger" value="listing">
					Recipes
				</Tabs.Trigger>
				<Tabs.Trigger className="rz-tabs-trigger" value="uploads">
					Uploads
				</Tabs.Trigger>
				<Tabs.Trigger className="rz-tabs-trigger" value="scrapes">
					Scrapes
				</Tabs.Trigger>
			</Tabs.List>
			<Tabs.Content className="rz-tabs-content" value="listing">
				{permissions?.includes('recipes:create') && <a href="/recipes/new">New Recipe</a>}

				<div className="recipes-listing">
					{recipes.map(r => {
						return (
							<RzCard
								key={r.id}
								title={r.title}
								body={
									<div>
										<div className="recipe-cover-image">
											{r.coverImageId ? (
												<img src={`/api/images/${r.coverImageId}`} alt={`${r.title} cover`} />
											) : (
												<div>No cover image</div>
											)}
										</div>
										<p>{r.description || ''}</p>
									</div>
								}
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
			<Tabs.Content className="rz-tabs-content" value="uploads">
				{permissions?.includes('recipes:upload') && <a href="/recipes/uploads/new">Upload Recipe</a>}
				<div className="recipe-uploads-listing">
					<table>
						<thead>
							<tr>
								<th>ID</th>
								<th>Filename</th>
								<th>MIME Type</th>
								<th>File Size</th>
								<th>Status</th>
								<th>Date Created</th>
								<th>Actions</th>
							</tr>
						</thead>
						<tbody>
							{recipeUploads.map(rI => {
								return (
									<tr key={rI.id}>
										<td>{rI.id}</td>
										<td>{rI.originalFilename}</td>
										<td>{rI.mimeType}</td>
										<td>{rI.fileSize}</td>
										<td>{rI.status}</td>
										<td>{rI.createdAt}</td>
										<td>
											<a href={`/recipes/uploads/${rI.id}`}>View</a>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			</Tabs.Content>
			<Tabs.Content className="rz-tabs-content" value="scrapes">
				<BookmarkletInstall apiKeys={apiKeys} userId={userId} />
			</Tabs.Content>
		</Tabs.Root>
	);
}
