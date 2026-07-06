import { RzStepError } from '@/classes';
import type { RecipeScrapeSource } from '@/types';

export async function parseBodyJson(request: Request): Promise<RecipeScrapeSource> {
	let body: unknown;
	try {
		body = await request.json();
	} catch {
		throw new RzStepError(400, 'Invalid JSON body', 'Request body could not be parsed as JSON');
	}

	return body as RecipeScrapeSource;
}
