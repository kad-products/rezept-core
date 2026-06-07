import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { trackApiKeyUsed } from '@/analytics';
import { errorResponse } from '@/api/utils';
import { getApiKeyByKey } from '@/repositories';

export default async function apiKeyMiddleware({ ctx, request }: RequestInfo<DefaultAppContext>): Promise<Response | undefined> {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader?.startsWith('Bearer ')) {
		return;
	}

	const key = authHeader.slice(7);
	let userId = 'unknown';
	try {
		const apiKey = await getApiKeyByKey(key, ctx.logger);

		userId = apiKey.userId;
		if (apiKey.revokeAt && new Date(apiKey.revokeAt) < new Date()) {
			return errorResponse('API key has been revoked', 403);
		}

		const now = Date.now();
		ctx.session = { userId: apiKey.userId, createdAt: now, lastAccessedAt: now };
		ctx.apiKey = apiKey;
		ctx.logger = ctx.logger.child({ userId: apiKey.userId });
		trackApiKeyUsed({
			userId,
			path: new URL(request.url).pathname,
			method: request.method,
			valid: true,
		});
	} catch (err) {
		ctx.logger.warn(`Error in API middleware: ${err}`);
		trackApiKeyUsed({
			userId,
			path: new URL(request.url).pathname,
			method: request.method,
			valid: false,
		});
		return errorResponse('Invalid API key', 403);
	}
}
