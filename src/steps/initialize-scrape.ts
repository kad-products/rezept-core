import { env } from 'cloudflare:workers';
import crypto from 'node:crypto';
import { RzStepError } from '@/classes';
import type RzLogger from '@/logger';
import { createRecipeScrape } from '@/repositories';
import type { RecipeScrapeDBRead } from '@/types';

export async function initializeScrape(parsedBody: unknown, userId: string, logger: RzLogger): Promise<RecipeScrapeDBRead> {
	const id = crypto.randomUUID();
	const stringified = JSON.stringify(parsedBody);
	const bodySize = stringified.length;

	try {
		await env.REZEPT_RECIPE_SCRAPES.put(id, stringified);
	} catch (err) {
		logger.warn(`Error writing scrape to R2: ${err}`);
		throw new RzStepError(400, 'Failed to initialize recipe scrape', `Error writing scrape to R2: ${err}`);
	}

	try {
		const result = await createRecipeScrape(id, bodySize, userId, logger);
		logger.info(`Scrape initialized: ${result.id}`);
		return result;
	} catch (err) {
		logger.warn(`Error creating scrape record, cleaning up R2 object ${id}: ${err}`);
		try {
			await env.REZEPT_RECIPE_SCRAPES.delete(id);
		} catch (deleteErr) {
			logger.warn(`Failed to clean up R2 object ${id}: ${deleteErr}`);
		}
		throw new RzStepError(400, 'Failed to initialize recipe scrape', `Error creating scrape record: ${err}`);
	}
}
