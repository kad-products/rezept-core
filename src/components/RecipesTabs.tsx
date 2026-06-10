'use client';
import { Tabs } from 'radix-ui';
import { RzCard } from '@/components/design-system';
import type { ApiKeyDBRead, RecipeDBRead, RecipeUploadDBRead } from '@/types';
import RecipeUploadsTable from './tables/RecipeUploadsTable';

export default function RecipesTabs({
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
				<RecipeUploadsTable recipeUploads={recipeUploads} />
			</Tabs.Content>
			<Tabs.Content className="rz-tabs-content" value="scrapes">
				<p>Make this list existing scrapes and their attempt info</p>
			</Tabs.Content>
		</Tabs.Root>
	);
}
