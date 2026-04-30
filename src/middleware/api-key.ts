import { type DefaultAppContext, type RequestInfo, requestInfo } from 'rwsdk/worker';
import { errorResponse } from '@/api/utils';
import { getApiKeyByKey } from '@/repositories';

export default async function apiKeyMiddleware({ ctx, request }: RequestInfo<DefaultAppContext>): Promise<Response | undefined> {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader?.startsWith('Bearer ')) {
		return;
	}

	const key = authHeader.slice(7);

	try {
		const apiKey = await getApiKeyByKey(key, ctx.logger);

		if (apiKey.revokeAt && new Date(apiKey.revokeAt) < new Date()) {
			return errorResponse('API key has been revoked', 403);
		}

		const now = Date.now();
		ctx.session = { userId: apiKey.userId, createdAt: now, lastAccessedAt: now };
		ctx.apiKey = apiKey;
	} catch (err) {
		requestInfo.ctx.logger.warn(`Error in API middleware: ${err}`);
		return errorResponse('Invalid API key', 403);
	}
}
