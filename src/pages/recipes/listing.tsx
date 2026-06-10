import type { RequestInfo } from 'rwsdk/worker';
import { RzCard } from '@/components/design-system';
import RecipesNav from '@/components/navs/RecipesNav';
import AppLayout from '@/layouts/app';
import { getRecipes } from '@/repositories';

export default async function Pages__recipes__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const recipes = await getRecipes(ctx.logger);
	return (
		<AppLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx} leftNav={<RecipesNav userPerms={ctx.permissions} />}>
			{ctx.permissions?.includes('recipes:create') && <a href="/recipes/new">New Recipe</a>}

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
		</AppLayout>
	);
}
