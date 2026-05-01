import { RzStepError } from '@/classes';
import type RzLogger from '@/logger';
import { recipesSchemas } from '@/schemas';
import type { RecipeScrapeData } from '@/types';
import type { ParsedRecipeScrape } from './transform-scrape-to-recipe';

export async function validateAsRecipe(
	transformedRecipe: ParsedRecipeScrape,
	userId: string,
	logger: RzLogger,
): Promise<RecipeScrapeData> {
	try {
		const parsed = recipesSchemas.scrape.safeParse({ authorId: userId, ...transformedRecipe });

		if (parsed.error) {
			const fieldErrors = JSON.stringify(parsed.error.flatten().fieldErrors);
			logger.warn(`Recipe data failed validation: ${fieldErrors}`);
			logger.debug(`Original scrape payload: ${JSON.stringify(transformedRecipe, null, 2)}`);
			throw new RzStepError(400, 'The recipe data could not be validated', `Recipe data failed validation: ${fieldErrors}`);
		}

		logger.debug(`Recipe data validated successfully`);
		return parsed.data;
	} catch (err) {
		if (err instanceof RzStepError) throw err;
		logger.warn(`Unexpected error validating recipe payload: ${err}`);
		throw new RzStepError(400, 'Failed to validate recipe', `Unexpected error validating recipe payload: ${err}`);
	}
}
