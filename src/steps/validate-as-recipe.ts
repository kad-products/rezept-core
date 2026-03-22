import type RzLogger from '@/logger';
import { recipeScrapeSchema } from '@/schemas';
import { RzStepError } from '@/types';
import type { ParsedRecipeScrape } from './transform-scrape-to-recipe';

export async function validateAsRecipe(transformedRecipe: ParsedRecipeScrape, userId: string, logger: RzLogger) {
	try {
		const parsed = recipeScrapeSchema.safeParse({ authorId: userId, ...transformedRecipe });

		if (parsed.error) {
			logger.warn(`Schema parsing found error in JSON-LD payload: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
			logger.info(`Original scrape payload: ${JSON.stringify(transformedRecipe, null, 2)}`);
			throw new RzStepError(400, JSON.stringify(parsed.error.flatten().fieldErrors));
		}

		logger.info(`Validated form data: ${JSON.stringify(parsed, null, 4)} `);
		return parsed.data;
	} catch (err) {
		throw new RzStepError(400, `Unexpected error validating payload as recipe: ${(err as Error).message}`);
	}
}
