import type { RequestInfo } from 'rwsdk/worker';
import { RzCard } from '@/components/design-system';
import AppLayout from '@/layouts/app';
import { getRecipes } from '@/repositories';

export default async function Pages__recipes__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const recipes = await getRecipes(ctx.logger);
	return (
		<AppLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx} leftNav="recipes">
			{ctx.permissions?.includes('recipes:create') && <a href="/recipes/new">New Recipe</a>}

			<div className="recipes-listing">
				{recipes.map(r => {
					return (
						<RzCard
							key={r.id}
							userPermissions={ctx.permissions || []}
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
									label: `View`,
									requiredPermission: 'recipes:read',
								},
								{
									href: `/recipes/${r.id}/favorite`,
									label: `Favorite`,
									requiredPermission: 'recipes:favorite',
								},
							]}
						/>
					);
				})}
			</div>
		</AppLayout>
	);
}
