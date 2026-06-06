import { env } from 'cloudflare:workers';

type AEDApiKeyUsedDataPoint = {
	userId: string;
	path: string;
	method: string;
	valid: boolean;
};

export function trackApiKeyUsed(dataPoint: AEDApiKeyUsedDataPoint): void {
	// convert to CF's somewhat goofy data point structure
	const indexes = [dataPoint.userId];
	const blobs = [dataPoint.path, dataPoint.method, dataPoint.valid.toString()];

	env.AED_API_KEY_USED.writeDataPoint({ indexes, blobs });
}
