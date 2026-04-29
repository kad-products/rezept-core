import { eq } from 'drizzle-orm';
import db from '@/db';
import type RzLogger from '@/logger';
import { recipeScrapes } from '@/models';
import type { RecipeScrape, RecipeScrapeStatus } from '@/types';
import { validateUuid } from './utils';

export async function createRecipeScrape(stringifiedRawJson: string, userId: string, logger: RzLogger): Promise<RecipeScrape> {
	const bodySize = stringifiedRawJson.length;
	logger.debug(`Creating recipe scrape with body size ${bodySize}`);

	const recipeScraped = await db
		.insert(recipeScrapes)
		.values({
			userId,
			rawJson: stringifiedRawJson,
			bodySize,
			createdBy: userId,
		})
		.returning();

	const result = recipeScraped[0];
	logger.info(`Created recipe scrape ${result.id}`);
	return result;
}

export async function updateRecipeScrapeStatus(
	recipeScrapeId: string,
	status: RecipeScrapeStatus,
	statusText: string,
	userId: string,
	logger: RzLogger,
): Promise<RecipeScrape> {
	if (!validateUuid(recipeScrapeId)) {
		throw new Error(`Invalid id: ${recipeScrapeId}`);
	}

	logger.debug(`Updating scrape ${recipeScrapeId} status to ${status}`);

	const updatedScrapes = await db
		.update(recipeScrapes)
		.set({
			status,
			statusText,
			updatedBy: userId,
		})
		.where(eq(recipeScrapes.id, recipeScrapeId))
		.returning();

	if (updatedScrapes.length !== 1) {
		throw new Error(`updateRecipeScrapeStatus: updated ${updatedScrapes.length} records instead of 1`);
	}

	logger.info(`Updated scrape ${recipeScrapeId} status to ${status}`);
	return updatedScrapes[0];
}
