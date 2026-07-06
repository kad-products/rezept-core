import { dump } from 'js-yaml';
import type { RequestInfo } from 'rwsdk/worker';
import AdminLayout from '@/layouts/admin';
import { getRecipeScrapes } from '@/repositories';
import { enrichScrapeWithFullObj } from '@/steps';

export default async function Pages__admin__recipes__scrapes__view({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const recipeScrapes = await getRecipeScrapes(ctx.logger);
	const matchingScrapes = recipeScrapes.filter(s => s.id === params.recipeScrapeId);
	const enrichedScrapes = await enrichScrapeWithFullObj(matchingScrapes, ctx.logger);
	return (
		<AdminLayout ctx={ctx} currentBasePage="recipes" pageTitle="Recipes">
			<div>
				<pre>{dump(enrichedScrapes[0].source?.jsonld)}</pre>
			</div>
		</AdminLayout>
	);
}
