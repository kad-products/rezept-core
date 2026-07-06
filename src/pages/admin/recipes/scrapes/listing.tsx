import type { RequestInfo } from 'rwsdk/worker';
import ScrapesExplorer from '@/components/ScrapesExplorer';
import AdminLayout from '@/layouts/admin';
import { getRecipeScrapes } from '@/repositories';
import { enrichScrapeWithFullObj } from '@/steps';

export default async function Pages__admin__recipes__scrapes__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const recipeScrapes = await getRecipeScrapes(ctx.logger);
	const enrichedScrapes = await enrichScrapeWithFullObj(recipeScrapes, ctx.logger);
	const rows = enrichedScrapes.map(u => ({ ...u, viewUrl: `/admin/recipes/scrapes/${u.id}` })).filter(row => row.source);
	return (
		<AdminLayout ctx={ctx} currentBasePage="recipes" pageTitle="Recipes">
			<ScrapesExplorer scrapes={rows} userPermissions={ctx.permissions} />
		</AdminLayout>
	);
}
