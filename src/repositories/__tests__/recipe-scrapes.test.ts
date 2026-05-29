import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import {
	createRecipeScrape,
	createRecipeScrapeAttempt,
	getRecipeScrapeAttempts,
	getRecipeScrapeById,
	getRecipeScrapesByStatus,
	linkRecipeScrapeToRecipe,
	updateRecipeScrapeStatus,
} from '../recipe-scrapes';
import { createRecipe } from '../recipes';

const logger = new Logger();

const bodySize = 42;

describe('createRecipeScrape', () => {
	let userId: string;
	let scrapeId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser2', null, logger);
		userId = user.id;
		scrapeId = crypto.randomUUID();
	});

	it('creates a scrape record and returns it', async () => {
		const result = await createRecipeScrape(scrapeId, bodySize, userId, logger);

		expect(result).toBeDefined();
		expect(result.id).toBe(scrapeId);
		expect(result.userId).toBe(userId);
		expect(result.bodySize).toBe(bodySize);
		expect(result.createdBy).toBe(userId);
	});

	it('sets status to SCRAPED on creation', async () => {
		const result = await createRecipeScrape(scrapeId, bodySize, userId, logger);

		expect(result.status).toBe('SCRAPED');
	});

	it('stores the correct body size', async () => {
		const result = await createRecipeScrape(scrapeId, bodySize, userId, logger);

		expect(result.bodySize).toBe(bodySize);
	});

	it('creates distinct records for multiple scrapes', async () => {
		const first = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);
		const second = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);

		expect(first.id).not.toBe(second.id);
	});
});

describe('updateRecipeScrapeStatus', () => {
	let userId: string;
	let scrapeId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		userId = user.id;
		const scrape = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);
		scrapeId = scrape.id;
	});

	it('updates status and statusText', async () => {
		const result = await updateRecipeScrapeStatus(scrapeId, 'TRANSFORMED', 'Transformed payload', userId, logger);

		expect(result.status).toBe('TRANSFORMED');
		expect(result.statusText).toBe('Transformed payload');
	});

	it('sets updatedBy to userId', async () => {
		const result = await updateRecipeScrapeStatus(scrapeId, 'TRANSFORMED', 'Transformed payload', userId, logger);

		expect(result.updatedBy).toBe(userId);
	});

	it('returns the updated record', async () => {
		const result = await updateRecipeScrapeStatus(scrapeId, 'FAILED', 'Something went wrong', userId, logger);

		expect(result).toBeDefined();
		expect(result.id).toBe(scrapeId);
	});

	it('throws for an invalid uuid', async () => {
		await expect(updateRecipeScrapeStatus('not-a-uuid', 'FAILED', 'text', userId, logger)).rejects.toThrow(
			'The value "not-a-uuid" is not a valid ID for a RecipeScrape',
		);
	});

	it('throws when id does not exist', async () => {
		const nonExistentId = crypto.randomUUID();
		await expect(updateRecipeScrapeStatus(nonExistentId, 'TRANSFORMED', 'text', userId, logger)).rejects.toThrow(
			'Expected 1 RecipeScrape record(s), but found 0',
		);
	});

	it('transitions through expected statuses', async () => {
		await updateRecipeScrapeStatus(scrapeId, 'TRANSFORMED', 'Transformed', userId, logger);
		await updateRecipeScrapeStatus(scrapeId, 'VALIDATED', 'Validated', userId, logger);
		await updateRecipeScrapeStatus(scrapeId, 'RECIPE_SAVED', 'Recipe saved', userId, logger);
		await updateRecipeScrapeStatus(scrapeId, 'SECTIONS_SAVED', 'Sections saved', userId, logger);
		await updateRecipeScrapeStatus(scrapeId, 'INGREDIENTS_SAVED', 'Ingredients saved', userId, logger);
		await updateRecipeScrapeStatus(scrapeId, 'INSTRUCTIONS_SAVED', 'Instructions saved', userId, logger);
		const result = await updateRecipeScrapeStatus(scrapeId, 'COMPLETED', 'Done', userId, logger);

		expect(result.status).toBe('COMPLETED');
	});

	it('handles FAILED status with error message', async () => {
		const result = await updateRecipeScrapeStatus(scrapeId, 'FAILED', 'Parse error: unexpected token', userId, logger);

		expect(result.status).toBe('FAILED');
		expect(result.statusText).toBe('Parse error: unexpected token');
	});
});

describe('linkRecipeScrapeToRecipe', () => {
	let userId: string;
	let scrapeId: string;
	let recipeId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		userId = user.id;
		const scrape = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);
		scrapeId = scrape.id;
		const recipe = await createRecipe({ authorId: userId, title: 'Test Recipe' }, userId, logger);
		recipeId = recipe.id;
	});

	it('sets recipeId on the scrape', async () => {
		const result = await linkRecipeScrapeToRecipe(scrapeId, recipeId, userId, logger);

		expect(result.recipeId).toBe(recipeId);
	});

	it('returns the updated scrape', async () => {
		const result = await linkRecipeScrapeToRecipe(scrapeId, recipeId, userId, logger);

		expect(result.id).toBe(scrapeId);
	});

	it('sets updatedBy', async () => {
		const result = await linkRecipeScrapeToRecipe(scrapeId, recipeId, userId, logger);

		expect(result.updatedBy).toBe(userId);
	});

	it('throws for an invalid scrape uuid', async () => {
		await expect(linkRecipeScrapeToRecipe('not-a-uuid', recipeId, userId, logger)).rejects.toThrow(
			'The value "not-a-uuid" is not a valid ID for a RecipeScrape',
		);
	});

	it('throws for an invalid recipe uuid', async () => {
		await expect(linkRecipeScrapeToRecipe(scrapeId, 'not-a-uuid', userId, logger)).rejects.toThrow(
			'The value "not-a-uuid" is not a valid ID for a Recipe',
		);
	});

	it('throws when scrape does not exist', async () => {
		const nonExistentId = crypto.randomUUID();
		await expect(linkRecipeScrapeToRecipe(nonExistentId, recipeId, userId, logger)).rejects.toThrow(
			'Expected 1 RecipeScrape record(s), but found 0',
		);
	});
});

describe('getRecipeScrapesByStatus', () => {
	let userId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		userId = user.id;
	});

	it('returns empty array when no scrapes exist', async () => {
		const result = await getRecipeScrapesByStatus(['SCRAPED'], logger);

		expect(result).toEqual([]);
	});

	it('returns scrapes matching the requested status', async () => {
		const scrape = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);

		const result = await getRecipeScrapesByStatus(['SCRAPED'], logger);

		expect(result).toHaveLength(1);
		expect(result[0].id).toBe(scrape.id);
	});

	it('does not return scrapes with a different status', async () => {
		const scrape = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);
		await updateRecipeScrapeStatus(scrape.id, 'COMPLETED', null, userId, logger);

		const result = await getRecipeScrapesByStatus(['SCRAPED'], logger);

		expect(result).toHaveLength(0);
	});

	it('returns scrapes matching any of the requested statuses', async () => {
		const scrape1 = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);
		const scrape2 = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);
		await updateRecipeScrapeStatus(scrape2.id, 'FAILED', 'error', userId, logger);

		const result = await getRecipeScrapesByStatus(['SCRAPED', 'FAILED'], logger);

		expect(result).toHaveLength(2);
		expect(result.map(s => s.id)).toContain(scrape1.id);
		expect(result.map(s => s.id)).toContain(scrape2.id);
	});

	it('returns results ordered by createdAt ascending', async () => {
		const first = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);
		await new Promise(resolve => setTimeout(resolve, 10));
		const second = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);

		const result = await getRecipeScrapesByStatus(['SCRAPED'], logger);

		expect(result[0].id).toBe(first.id);
		expect(result[1].id).toBe(second.id);
	});

	it('returns empty array for empty status list', async () => {
		await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);

		const result = await getRecipeScrapesByStatus([], logger);

		expect(result).toEqual([]);
	});
});

describe('getRecipeScrapeById', () => {
	let userId: string;
	let scrapeId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		userId = user.id;
		const scrape = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);
		scrapeId = scrape.id;
	});

	it('returns the scrape by id', async () => {
		const result = await getRecipeScrapeById(scrapeId, logger);

		expect(result.id).toBe(scrapeId);
	});

	it('returns the correct scrape when multiple exist', async () => {
		const other = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);

		const result = await getRecipeScrapeById(scrapeId, logger);

		expect(result.id).toBe(scrapeId);
		expect(result.id).not.toBe(other.id);
	});

	it('throws for an invalid uuid', async () => {
		await expect(getRecipeScrapeById('not-a-uuid', logger)).rejects.toThrow(
			'The value "not-a-uuid" is not a valid ID for a RecipeScrape',
		);
	});

	it('throws when id does not exist', async () => {
		const nonExistentId = crypto.randomUUID();
		await expect(getRecipeScrapeById(nonExistentId, logger)).rejects.toThrow('Expected 1 RecipeScrape record(s), but found 0');
	});
});

describe('createRecipeScrapeAttempt', () => {
	let userId: string;
	let scrapeId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		userId = user.id;
		const scrape = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);
		scrapeId = scrape.id;
	});

	it('creates an attempt and returns it', async () => {
		const result = await createRecipeScrapeAttempt(scrapeId, 'api', null, 'TRANSFORMED', 'Transformed', null, userId, logger);

		expect(result).toBeDefined();
		expect(result.recipeScrapeId).toBe(scrapeId);
		expect(result.status).toBe('TRANSFORMED');
		expect(result.statusText).toBe('Transformed');
		expect(result.createdBy).toBe(userId);
	});

	it('stores source as api', async () => {
		const result = await createRecipeScrapeAttempt(scrapeId, 'api', null, 'TRANSFORMED', null, null, userId, logger);

		expect(result.source).toBe('api');
	});

	it('accepts workflow source and workflowInstanceId', async () => {
		const instanceId = crypto.randomUUID();
		const result = await createRecipeScrapeAttempt(scrapeId, 'workflow', instanceId, 'TRANSFORMED', null, null, userId, logger);

		expect(result.source).toBe('workflow');
		expect(result.workflowInstanceId).toBe(instanceId);
	});

	it('stores appVersion when provided', async () => {
		const result = await createRecipeScrapeAttempt(scrapeId, 'api', null, 'TRANSFORMED', null, '1.2.3', userId, logger);

		expect(result.appVersion).toBe('1.2.3');
	});

	it('stores null workflowInstanceId when passed null', async () => {
		const result = await createRecipeScrapeAttempt(scrapeId, 'api', null, 'TRANSFORMED', null, null, userId, logger);

		expect(result.workflowInstanceId).toBeNull();
	});

	it('throws for an invalid uuid', async () => {
		await expect(createRecipeScrapeAttempt('not-a-uuid', 'api', null, 'TRANSFORMED', null, null, userId, logger)).rejects.toThrow(
			'The value "not-a-uuid" is not a valid ID for a RecipeScrape',
		);
	});

	it('creates multiple attempts for the same scrape', async () => {
		await createRecipeScrapeAttempt(scrapeId, 'api', null, 'TRANSFORMED', null, null, userId, logger);
		await createRecipeScrapeAttempt(scrapeId, 'api', null, 'VALIDATED', null, null, userId, logger);

		const attempts = await getRecipeScrapeAttempts(scrapeId, logger);
		expect(attempts).toHaveLength(2);
	});
});

describe('getRecipeScrapeAttempts', () => {
	let userId: string;
	let scrapeId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		userId = user.id;
		const scrape = await createRecipeScrape(crypto.randomUUID(), bodySize, userId, logger);
		scrapeId = scrape.id;
	});

	it('returns empty array when no attempts exist', async () => {
		const result = await getRecipeScrapeAttempts(scrapeId, logger);

		expect(result).toEqual([]);
	});

	it('returns attempts in ascending createdAt order', async () => {
		await createRecipeScrapeAttempt(scrapeId, 'api', null, 'TRANSFORMED', null, null, userId, logger);
		await new Promise(resolve => setTimeout(resolve, 10));
		await createRecipeScrapeAttempt(scrapeId, 'api', null, 'VALIDATED', null, null, userId, logger);

		const result = await getRecipeScrapeAttempts(scrapeId, logger);

		expect(result[0].status).toBe('TRANSFORMED');
		expect(result[1].status).toBe('VALIDATED');
	});

	it('only returns attempts for the given scrape', async () => {
		const otherUser = await createUser('otheruser', null, logger);
		const otherScrape = await createRecipeScrape(crypto.randomUUID(), bodySize, otherUser.id, logger);

		await createRecipeScrapeAttempt(scrapeId, 'api', null, 'TRANSFORMED', null, null, userId, logger);
		await createRecipeScrapeAttempt(otherScrape.id, 'api', null, 'TRANSFORMED', null, null, otherUser.id, logger);

		const result = await getRecipeScrapeAttempts(scrapeId, logger);

		expect(result).toHaveLength(1);
		expect(result[0].recipeScrapeId).toBe(scrapeId);
	});

	it('throws for an invalid uuid', async () => {
		await expect(getRecipeScrapeAttempts('not-a-uuid', logger)).rejects.toThrow(
			'The value "not-a-uuid" is not a valid ID for a RecipeScrape',
		);
	});
});
