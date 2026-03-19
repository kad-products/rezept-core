import { eq } from 'drizzle-orm';
import { requestInfo } from 'rwsdk/worker';
import db from '@/db';
import { recipeScrapes } from '@/models';
import type { RecipeScrapeStatus } from '@/types';
import { validateUuid } from '@/utils';

export async function createRecipeScrape(stringifiedRawJson: string, userId: string) {
	const bodySize = stringifiedRawJson.length;
	requestInfo.ctx.logger.info(`Stringified data in createRecipeScrape is ${bodySize} bytes`);

	const recipeScraped = await db
		.insert(recipeScrapes)
		.values({
			userId,
			rawJson: stringifiedRawJson,
			bodySize,
			createdBy: userId,
		})
		.returning();

	return recipeScraped[0];
}

export async function updateRecipeScrapeStatus(
	recipeScrapeId: string,
	status: RecipeScrapeStatus,
	statusText: string,
	userId: string,
) {
	if (!validateUuid(recipeScrapeId)) {
		throw new Error(`Invalid id: ${recipeScrapeId}`);
	}

	requestInfo.ctx.logger.info(
		`Updating recipe scrape status in updateRecipeScrapeStatus: ${JSON.stringify({ recipeScrapeId, status, statusText }, null, 4)} `,
	);

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

	return updatedScrapes[0];
}
