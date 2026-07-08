import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNoopLogger } from '@/logger';

const mockScrapesBucket = vi.hoisted(() => ({
	get: vi.fn(),
}));

vi.mock('cloudflare:workers', () => ({
	env: { REZEPT_RECIPE_SCRAPES: mockScrapesBucket },
}));

import { enrichScrapeWithFullObj } from '@/steps';
import type { RecipeScrapeDBRead } from '@/types';

const logger = createNoopLogger();

const mockScrape = { id: 'scrape-001', userId: 'user-001' } as unknown as RecipeScrapeDBRead;
const validSource = { url: 'https://example.com/recipe', jsonld: [{ '@type': 'Recipe' }] };

function makeR2Object(data: unknown) {
	return { json: vi.fn().mockResolvedValue(data) };
}

describe('enrichScrapeWithFullObj', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns enriched scrapes when R2 objects exist with valid source', async () => {
		mockScrapesBucket.get.mockResolvedValue(makeR2Object(validSource));

		const result = await enrichScrapeWithFullObj([mockScrape], logger);

		expect(result).toHaveLength(1);
		expect(result[0].source).toEqual(validSource);
		expect(result[0].id).toBe(mockScrape.id);
	});

	it('returns scrape with undefined source when R2 object is not found', async () => {
		mockScrapesBucket.get.mockResolvedValue(null);

		const result = await enrichScrapeWithFullObj([mockScrape], logger);

		expect(result).toHaveLength(1);
		expect(result[0].source).toBeUndefined();
	});

	it('returns scrape with undefined source when R2 object json() returns null', async () => {
		mockScrapesBucket.get.mockResolvedValue(makeR2Object(null));

		const result = await enrichScrapeWithFullObj([mockScrape], logger);

		expect(result).toHaveLength(1);
		expect(result[0].source).toBeUndefined();
	});

	it('returns scrape with undefined source when R2 get throws', async () => {
		mockScrapesBucket.get.mockRejectedValue(new Error('R2 unavailable'));

		const result = await enrichScrapeWithFullObj([mockScrape], logger);

		expect(result).toHaveLength(1);
		expect(result[0].source).toBeUndefined();
	});

	it('handles multiple scrapes independently', async () => {
		const scrape2 = { id: 'scrape-002', userId: 'user-001' } as unknown as RecipeScrapeDBRead;
		mockScrapesBucket.get.mockResolvedValueOnce(makeR2Object(validSource)).mockResolvedValueOnce(null);

		const result = await enrichScrapeWithFullObj([mockScrape, scrape2], logger);

		expect(result).toHaveLength(2);
		expect(result[0].source).toEqual(validSource);
		expect(result[1].source).toBeUndefined();
	});

	it('returns empty array when given no scrapes', async () => {
		const result = await enrichScrapeWithFullObj([], logger);
		expect(result).toEqual([]);
	});
});
