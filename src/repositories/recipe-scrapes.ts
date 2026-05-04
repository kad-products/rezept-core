import { eq } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import type RzLogger from '@/logger';
import { recipeScrapes } from '@/models';
import type { RecipeScrapeDBRead, RecipeScrapeStatus } from '@/types';
import { validateUuid } from './utils';

export async function createRecipeScrape(
	stringifiedRawJson: string,
	userId: string,
	logger: RzLogger,
): Promise<RecipeScrapeDBRead> {
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
	statusText: string | null,
	userId: string,
	logger: RzLogger,
): Promise<RecipeScrapeDBRead> {
	if (!validateUuid(recipeScrapeId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [recipeScrapeId, 'RecipeScrape']);
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
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [updatedScrapes.length, 1, 'RecipeScrape']);
	}

	logger.info(`Updated scrape ${recipeScrapeId} status to ${status}`);
	return updatedScrapes[0];
}
