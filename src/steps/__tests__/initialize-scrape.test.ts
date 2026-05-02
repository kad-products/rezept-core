import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RzStepError } from '@/classes';
import Logger from '@/logger';
import { initializeScrape } from '@/steps';
import type { RecipeScrape } from '@/types';

vi.mock('@/repositories', () => ({
	createRecipeScrape: vi.fn(),
}));

import { createRecipeScrape } from '@/repositories';

const logger = new Logger();
const userId = '00000000-0000-0000-0000-000000000001';
const mockScrape = { id: 'scrape-123', userId } as unknown as RecipeScrape;

describe('initializeScrape', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls createRecipeScrape with the stringified payload and returns the result', async () => {
		vi.mocked(createRecipeScrape).mockResolvedValue(mockScrape);
		const parsedBody = { url: 'https://example.com/recipe', jsonld: [{ '@type': 'Recipe' }] };

		const result = await initializeScrape(parsedBody, userId, logger);

		expect(createRecipeScrape).toHaveBeenCalledWith(JSON.stringify(parsedBody), userId, logger);
		expect(result).toBe(mockScrape);
	});

	it('throws RzStepError 400 when createRecipeScrape fails', async () => {
		vi.mocked(createRecipeScrape).mockRejectedValue(new Error('DB connection error'));

		await expect(initializeScrape({}, userId, logger)).rejects.toThrow(RzStepError);
		await expect(initializeScrape({}, userId, logger)).rejects.toMatchObject({ code: 400 });
	});
});
