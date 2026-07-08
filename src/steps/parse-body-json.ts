import { RzStepError } from '@/classes';
import type { RecipeScrapeSource } from '@/types';

export async function parseBodyJson(request: Request): Promise<RecipeScrapeSource> {
	let body: unknown;
	try {
		body = await request.json();
	} catch (err) {
		throw new RzStepError(
			400,
			'Invalid JSON body',
			'Request body could not be parsed as JSON',
			false,
			err instanceof Error ? err.cause : undefined,
		);
	}

	return body as RecipeScrapeSource;
}
