import { createRecipeScrape } from '@/repositories/recipe-scrapes';
import { type RecipeScrape, RzStepError } from '@/types';

export async function initializeScrape(parsedBody: unknown, userId: string) {
	let recipeScrape: RecipeScrape;
	try {
		recipeScrape = await createRecipeScrape(JSON.stringify(parsedBody), userId);
	} catch (err) {
		throw new RzStepError(400, (err as Error).message);
	}
	return recipeScrape.id;
}
