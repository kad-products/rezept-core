import { eq, inArray, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import type RzLogger from '@/logger';
import { recipeScrapes } from '@/models';
import type { RecipeScrapeDBRead, RecipeScrapeStatus } from '@/types';
import { validateUuid } from './utils';

export async function createRecipeScrape(
	id: string,
	bodySize: number,
	userId: string,
	logger: RzLogger,
): Promise<RecipeScrapeDBRead> {
	logger.debug(`Creating recipe scrape with body size ${bodySize}`);

	const recipeScraped = await db
		.insert(recipeScrapes)
		.values({
			id,
			userId,
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
			updatedAt: sql`(datetime('now', 'localtime'))`,
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

export async function linkRecipeScrapeToRecipe(
	recipeScrapeId: string,
	recipeId: string,
	userId: string,
	logger: RzLogger,
): Promise<RecipeScrapeDBRead> {
	if (!validateUuid(recipeScrapeId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [recipeScrapeId, 'RecipeScrape']);
	}
	if (!validateUuid(recipeId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [recipeId, 'Recipe']);
	}

	logger.debug(`Linking scrape ${recipeScrapeId} to recipe ${recipeId}`);

	const updated = await db
		.update(recipeScrapes)
		.set({
			recipeId,
			updatedAt: sql`(datetime('now', 'localtime'))`,
			updatedBy: userId,
		})
		.where(eq(recipeScrapes.id, recipeScrapeId))
		.returning();

	if (updated.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [updated.length, 1, 'RecipeScrape']);
	}

	logger.info(`Linked scrape ${recipeScrapeId} to recipe ${recipeId}`);
	return updated[0];
}

export async function getRecipeScrapesByStatus(status: RecipeScrapeStatus[], logger: RzLogger): Promise<RecipeScrapeDBRead[]> {
	logger.debug(`Fetching scrapes with status in ${status.join(', ')}`);

	const scrapes = await db
		.select()
		.from(recipeScrapes)
		.where(inArray(recipeScrapes.status, status))
		.orderBy(recipeScrapes.createdAt);

	logger.info(`Fetched ${scrapes.length} scrapes with status in ${status.join(', ')}`);
	return scrapes;
}

export async function getRecipeScrapeById(recipeScrapeId: string, logger: RzLogger): Promise<RecipeScrapeDBRead> {
	if (!validateUuid(recipeScrapeId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [recipeScrapeId, 'RecipeScrape']);
	}

	logger.debug(`Fetching scrape with ID ${recipeScrapeId}`);

	const scrapes = await db.select().from(recipeScrapes).where(eq(recipeScrapes.id, recipeScrapeId));

	if (scrapes.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [scrapes.length, 1, 'RecipeScrape']);
	}

	logger.info(`Fetched scrape with ID ${recipeScrapeId}`);
	return scrapes[0];
}
