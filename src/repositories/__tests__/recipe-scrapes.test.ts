import { beforeEach, describe, expect, it, vi } from 'vitest';
import type RzLogger from '@/logger';
import Logger from '@/logger';
import { createUser } from '@/repositories/users';
import { resetDb } from '../../../tests/mocks/db';
import { createRecipeScrape, updateRecipeScrapeStatus } from '../recipe-scrapes';

vi.mock('cloudflare:workers', () => ({
	env: { REZEPT_ENV: 'development' },
}));

interface MockRequestInfo {
	ctx: {
		user: { id: string } | null;
		logger: RzLogger;
	};
}

const mockRequestInfo: MockRequestInfo = {
	ctx: {
		user: { id: 'test-user-id' },
		logger: new Logger(),
	},
};

vi.mock('rwsdk/worker', () => ({
	serverAction: (action: any) => {
		return Array.isArray(action) ? action[action.length - 1] : action;
	},
	get requestInfo() {
		return mockRequestInfo;
	},
}));

const rawJson = JSON.stringify({ url: 'https://example.com/recipe', jsonld: [] });

describe('createRecipeScrape', () => {
	let userId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser2');
		userId = user.id;
	});

	it('creates a scrape record and returns it', async () => {
		const result = await createRecipeScrape(rawJson, userId);

		expect(result).toBeDefined();
		expect(result.id).toBeDefined();
		expect(result.userId).toBe(userId);
		expect(result.rawJson).toBe(rawJson);
		expect(result.bodySize).toBe(rawJson.length);
		expect(result.createdBy).toBe(userId);
	});

	it('sets status to SCRAPED on creation', async () => {
		const result = await createRecipeScrape(rawJson, userId);

		expect(result.status).toBe('SCRAPED');
	});

	it('stores the correct body size', async () => {
		const result = await createRecipeScrape(rawJson, userId);

		expect(result.bodySize).toBe(rawJson.length);
	});

	it('creates distinct records for multiple scrapes', async () => {
		const first = await createRecipeScrape(rawJson, userId);
		const second = await createRecipeScrape(rawJson, userId);

		expect(first.id).not.toBe(second.id);
	});
});

describe('updateRecipeScrapeStatus', () => {
	let userId: string;
	let scrapeId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser');
		userId = user.id;
		const scrape = await createRecipeScrape(rawJson, userId);
		scrapeId = scrape.id;
	});

	it('updates status and statusText', async () => {
		const result = await updateRecipeScrapeStatus(scrapeId, 'TRANSFORMED', 'Transformed payload', userId);

		expect(result.status).toBe('TRANSFORMED');
		expect(result.statusText).toBe('Transformed payload');
	});

	it('sets updatedBy to userId', async () => {
		const result = await updateRecipeScrapeStatus(scrapeId, 'TRANSFORMED', 'Transformed payload', userId);

		expect(result.updatedBy).toBe(userId);
	});

	it('returns the updated record', async () => {
		const result = await updateRecipeScrapeStatus(scrapeId, 'FAILED', 'Something went wrong', userId);

		expect(result).toBeDefined();
		expect(result.id).toBe(scrapeId);
	});

	it('throws for an invalid uuid', async () => {
		await expect(updateRecipeScrapeStatus('not-a-uuid', 'FAILED', 'text', userId)).rejects.toThrow('Invalid id');
	});

	it('throws when id does not exist', async () => {
		const nonExistentId = crypto.randomUUID();
		await expect(updateRecipeScrapeStatus(nonExistentId, 'TRANSFORMED', 'text', userId)).rejects.toThrow(
			'updated 0 records instead of 1',
		);
	});

	it('transitions through expected statuses', async () => {
		await updateRecipeScrapeStatus(scrapeId, 'TRANSFORMED', 'Transformed', userId);
		await updateRecipeScrapeStatus(scrapeId, 'VALIDATED', 'Validated', userId);
		await updateRecipeScrapeStatus(scrapeId, 'RECIPE_SAVED', 'Recipe saved', userId);
		await updateRecipeScrapeStatus(scrapeId, 'SECTIONS_SAVED', 'Sections saved', userId);
		await updateRecipeScrapeStatus(scrapeId, 'INGREDIENTS_SAVED', 'Ingredients saved', userId);
		await updateRecipeScrapeStatus(scrapeId, 'INSTRUCTIONS_SAVED', 'Instructions saved', userId);
		const result = await updateRecipeScrapeStatus(scrapeId, 'COMPLETED', 'Done', userId);

		expect(result.status).toBe('COMPLETED');
	});

	it('handles FAILED status with error message', async () => {
		const result = await updateRecipeScrapeStatus(scrapeId, 'FAILED', 'Parse error: unexpected token', userId);

		expect(result.status).toBe('FAILED');
		expect(result.statusText).toBe('Parse error: unexpected token');
	});
});
