import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
	AED_SCRAPE_ATTEMPTS: { writeDataPoint: vi.fn() },
}));

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

import { trackScrapeAttempt } from '../scrape-attempt';

describe('trackScrapeAttempt', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('writes a data point with domain and success as blobs, durationMs as a double', () => {
		trackScrapeAttempt({ domain: 'allrecipes.com', success: true, durationMs: 1250, userId: 'user-123' });

		expect(mockEnv.AED_SCRAPE_ATTEMPTS.writeDataPoint).toHaveBeenCalledWith({
			indexes: ['user-123'],
			blobs: ['allrecipes.com', 'true'],
			doubles: [1250],
		});
	});

	it('uses userId as the index', () => {
		trackScrapeAttempt({ domain: 'seriouseats.com', success: true, durationMs: 800, userId: 'user-abc' });

		const call = mockEnv.AED_SCRAPE_ATTEMPTS.writeDataPoint.mock.calls[0][0];
		expect(call.indexes).toEqual(['user-abc']);
	});

	// CF Analytics Engine has no native boolean type — success is serialised as a string so it
	// can be filtered in SQL queries: blob2 = 'true' / blob2 = 'false'
	it('serialises success: false as the string "false" for SQL query compatibility', () => {
		trackScrapeAttempt({ domain: 'example.com', success: false, durationMs: 300, userId: 'user-123' });

		const call = mockEnv.AED_SCRAPE_ATTEMPTS.writeDataPoint.mock.calls[0][0];
		expect(call.blobs[1]).toBe('false');
	});

	it('puts durationMs in doubles so it is queryable as AVG/SUM/percentile', () => {
		trackScrapeAttempt({ domain: 'example.com', success: true, durationMs: 4200, userId: 'user-123' });

		const call = mockEnv.AED_SCRAPE_ATTEMPTS.writeDataPoint.mock.calls[0][0];
		expect(call.doubles).toEqual([4200]);
	});

	it('includes the source domain as the first blob', () => {
		trackScrapeAttempt({ domain: 'budgetbytes.com', success: true, durationMs: 600, userId: 'user-123' });

		const call = mockEnv.AED_SCRAPE_ATTEMPTS.writeDataPoint.mock.calls[0][0];
		expect(call.blobs[0]).toBe('budgetbytes.com');
	});
});
