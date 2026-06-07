import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RzStepError } from '@/classes';
import { createNoopLogger } from '@/logger';

const mockScrapesBucket = vi.hoisted(() => ({
	put: vi.fn(),
	delete: vi.fn(),
}));

vi.mock('cloudflare:workers', () => ({
	env: { REZEPT_RECIPE_SCRAPES: mockScrapesBucket },
}));

vi.mock('@/repositories', () => ({
	createRecipeScrape: vi.fn(),
}));

import { createRecipeScrape } from '@/repositories';
import { initializeScrape } from '@/steps';
import type { RecipeScrapeDBRead } from '@/types';

const logger = createNoopLogger();
const userId = '00000000-0000-0000-0000-000000000001';
const mockScrape = { id: 'scrape-123', userId } as unknown as RecipeScrapeDBRead;

describe('initializeScrape', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(createRecipeScrape).mockResolvedValue(mockScrape);
		mockScrapesBucket.put.mockResolvedValue(undefined);
		mockScrapesBucket.delete.mockResolvedValue(undefined);
	});

	it('writes the stringified payload to R2 and creates the scrape record', async () => {
		const parsedBody = { url: 'https://example.com/recipe', jsonld: [{ '@type': 'Recipe' }] };

		const result = await initializeScrape(parsedBody, userId, logger);

		expect(mockScrapesBucket.put).toHaveBeenCalledTimes(1);
		const [r2Key, r2Body] = mockScrapesBucket.put.mock.calls[0];
		expect(r2Body).toBe(JSON.stringify(parsedBody));
		expect(createRecipeScrape).toHaveBeenCalledWith(r2Key, JSON.stringify(parsedBody).length, userId, logger);
		expect(result).toBe(mockScrape);
	});

	it('uses the same id for the R2 key and the scrape record', async () => {
		await initializeScrape({}, userId, logger);

		const r2Key = mockScrapesBucket.put.mock.calls[0][0];
		const [scrapeId] = vi.mocked(createRecipeScrape).mock.calls[0];
		expect(r2Key).toBe(scrapeId);
	});

	it('throws RzStepError without calling createRecipeScrape when R2 write fails', async () => {
		mockScrapesBucket.put.mockRejectedValueOnce(new Error('R2 unavailable'));

		await expect(initializeScrape({}, userId, logger)).rejects.toThrow(RzStepError);
		expect(createRecipeScrape).not.toHaveBeenCalled();
	});

	it('deletes the R2 object when createRecipeScrape fails', async () => {
		vi.mocked(createRecipeScrape).mockRejectedValueOnce(new Error('DB connection error'));

		await expect(initializeScrape({}, userId, logger)).rejects.toThrow(RzStepError);

		const r2Key = mockScrapesBucket.put.mock.calls[0][0];
		expect(mockScrapesBucket.delete).toHaveBeenCalledWith(r2Key);
	});

	it('still throws RzStepError when createRecipeScrape fails even if R2 cleanup also fails', async () => {
		vi.mocked(createRecipeScrape).mockRejectedValueOnce(new Error('DB error'));
		mockScrapesBucket.delete.mockRejectedValueOnce(new Error('R2 delete failed'));

		await expect(initializeScrape({}, userId, logger)).rejects.toMatchObject({ code: 400 });
	});

	it('throws RzStepError with code 400 on failure', async () => {
		vi.mocked(createRecipeScrape).mockRejectedValueOnce(new Error('DB error'));

		await expect(initializeScrape({}, userId, logger)).rejects.toMatchObject({ code: 400 });
	});
});
