import { RzStepError } from '@/classes';
import type RzLogger from '@/logger';
import { createRecipeScrape } from '@/repositories';
import type { RecipeScrape } from '@/types';

export async function initializeScrape(parsedBody: unknown, userId: string, logger: RzLogger): Promise<RecipeScrape> {
	try {
		const result = await createRecipeScrape(JSON.stringify(parsedBody), userId, logger);
		logger.info(`Scrape initialized: ${result.id}`);
		return result;
	} catch (err) {
		logger.warn(`Error initializing scrape: ${err}`);
		throw new RzStepError(400, 'Failed to initialize recipe scrape', `Error initializing scrape: ${err}`);
	}
}
