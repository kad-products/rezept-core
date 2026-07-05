import { env } from 'cloudflare:workers';
import { RzStepError } from '@/classes';
import type { RecipeScrapeDBRead, RecipeScrapeDBReadEnriched, RzLogger } from '@/types';

type R2Structure =
	| {
			url: string;
			jsonld: Record<string, unknown>[];
	  }
	| undefined;

export async function enrichScrapeWithFullObj(
	scrapes: RecipeScrapeDBRead[],
	logger: RzLogger,
): Promise<RecipeScrapeDBReadEnriched[]> {
	return await Promise.all(
		scrapes.map(async scrape => {
			try {
				const object = await env.REZEPT_RECIPE_SCRAPES.get(scrape.id);
				const source: R2Structure = await object?.json();
				if (!source) {
					throw new RzStepError(400, 'No source R2 object found', `R2 object ${scrape.id} is either not found or stored empty`);
				}
				return { ...scrape, source };
			} catch (deleteErr) {
				logger.warn(`Failed to clean up R2 object ${scrape.id}: ${deleteErr}`);
				return { ...scrape, source: undefined };
			}
		}),
	);
}
