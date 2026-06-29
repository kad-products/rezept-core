import type { RequestInfo } from 'rwsdk/worker';
import { RzLink } from '@/components/design-system';
import RecipeScrapesTable from '@/components/tables/RecipeScrapesTable';
import AppLayout from '@/layouts/app';
import { getRecipeScrapes } from '@/repositories';

export default async function Pages__recipes__scrapes__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const userId = ctx.user?.id;
	const recipeScrapes = userId ? await getRecipeScrapes(userId, ctx.logger) : [];
	return (
		<AppLayout currentBasePage="recipes" pageTitle="Recipes" ctx={ctx} leftNav="recipes">
			<RzLink
				permissions={ctx.permissions}
				requiredPermission="profile:read"
				label="Setup / View Bookmarklet"
				href="/profile/scrape-bookmarklet"
			/>
			<RecipeScrapesTable recipeScrapes={recipeScrapes} />
		</AppLayout>
	);
}
