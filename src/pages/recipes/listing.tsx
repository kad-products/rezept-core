import type { RequestInfo } from 'rwsdk/worker';
import { RzCard, RzLink } from '@/components/design-system';
import AppLayout from '@/layouts/app';
import { getRecipes } from '@/repositories';

export default async function Pages__recipes__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const recipes = await getRecipes({}, 10, 0, ctx.logger);
	return (
		<AppLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx} leftNav="recipes">
			<RzLink userPermissions={ctx.permissions} requiredPermission="recipes:create" label="New Recipe" href="/recipes/new" />

			<div className="recipes-listing">
				{recipes.map(r => {
					return (
						<RzCard
							key={r.id}
							userPermissions={ctx.permissions}
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
