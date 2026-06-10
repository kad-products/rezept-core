import { and, asc, eq, inArray, isNull, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import { recipeScrapeAttempts, recipeScrapes } from '@/models';
import type {
	RecipeScrapeAttemptDBRead,
	RecipeScrapeAttemptSource,
	RecipeScrapeDBRead,
	RecipeScrapeStatus,
	RzLogger,
} from '@/types';
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

export async function getRecipeScrapes(userId: string, logger: RzLogger): Promise<RecipeScrapeDBRead[]> {
	logger.debug(`Fetching recipe scrapes for user ${userId}`);
	const results = await db
		.select()
		.from(recipeScrapes)
		.where(and(eq(recipeScrapes.userId, userId), isNull(recipeScrapes.deletedAt)));
	logger.debug(`Fetched ${results.length} recipe scrapes`);
	return results;
}

export async function createRecipeScrapeAttempt(
	recipeScrapeId: string,
	source: RecipeScrapeAttemptSource,
	workflowInstanceId: string | null,
	status: RecipeScrapeStatus,
	statusText: string | null,
	appVersion: string | null,
	userId: string,
	logger: RzLogger,
): Promise<RecipeScrapeAttemptDBRead> {
	if (!validateUuid(recipeScrapeId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [recipeScrapeId, 'RecipeScrape']);
	}

	logger.debug(`Creating scrape attempt for ${recipeScrapeId}: ${status}`);

	const [attempt] = await db
		.insert(recipeScrapeAttempts)
		.values({
			recipeScrapeId,
			source,
			workflowInstanceId,
			status,
			statusText,
			appVersion,
			createdBy: userId,
		})
		.returning();

	logger.info(`Created scrape attempt for ${recipeScrapeId}: ${status}`);
	return attempt;
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

export async function getRecipeScrapeAttempts(recipeScrapeId: string, logger: RzLogger): Promise<RecipeScrapeAttemptDBRead[]> {
	if (!validateUuid(recipeScrapeId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [recipeScrapeId, 'RecipeScrape']);
	}

	logger.debug(`Fetching attempts for scrape ${recipeScrapeId}`);

	const attempts = await db
		.select()
		.from(recipeScrapeAttempts)
		.where(eq(recipeScrapeAttempts.recipeScrapeId, recipeScrapeId))
		.orderBy(asc(recipeScrapeAttempts.createdAt));

	logger.info(`Fetched ${attempts.length} attempts for scrape ${recipeScrapeId}`);
	return attempts;
}
