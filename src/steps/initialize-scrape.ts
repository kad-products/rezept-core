import { RzStepError } from '@/classes';
import type RzLogger from '@/logger';
import { createRecipeScrape } from '@/repositories/recipe-scrapes';
import type { RecipeScrape } from '@/types';

export async function initializeScrape(parsedBody: unknown, userId: string, logger: RzLogger): Promise<RecipeScrape> {
	try {
		return await createRecipeScrape(JSON.stringify(parsedBody), userId, logger);
	} catch (err) {
		throw new RzStepError(400, (err as Error).message);
	}
}
