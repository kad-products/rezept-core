import { RzStepError } from '@/classes';
import { createRecipeScrape } from '@/repositories/recipe-scrapes';
import type { RecipeScrape } from '@/types';

export async function initializeScrape(parsedBody: unknown, userId: string): Promise<RecipeScrape> {
	try {
		return await createRecipeScrape(JSON.stringify(parsedBody), userId);
	} catch (err) {
		throw new RzStepError(400, (err as Error).message);
	}
}
