import type { RequestInfo } from 'rwsdk/worker';
import RecipesNav from '@/components/navs/RecipesNav';
import RecipeScrapesTable from '@/components/tables/RecipeScrapesTable';
import AppLayout from '@/layouts/app';
import { getRecipeScrapes } from '@/repositories';

export default async function Pages__recipes__scrapes__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const userId = ctx.user?.id;
	const recipeScrapes = userId ? await getRecipeScrapes(userId, ctx.logger) : [];
	return (
		<AppLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx} leftNav={<RecipesNav />}>
			<a href="/profile/scrape-bookmarklet">Setup / View Bookmarklet</a>
			<RecipeScrapesTable recipeScrapes={recipeScrapes} />
		</AppLayout>
	);
}
