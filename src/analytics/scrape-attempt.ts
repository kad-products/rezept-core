import { env } from 'cloudflare:workers';

type AEDScrapeAttemptDataPoint = {
	domain: string;
	success: boolean;
	durationMs: number;
	userId: string;
};

export function trackScrapeAttempt(dataPoint: AEDScrapeAttemptDataPoint): void {
	// convert to CF's somewhat goofy data point structure
	const indexes = [dataPoint.userId];
	const blobs = [dataPoint.domain, dataPoint.success.toString()];
	const doubles = [dataPoint.durationMs];

	env.AED_SCRAPE_ATTEMPTS.writeDataPoint({ indexes, blobs, doubles });
}
