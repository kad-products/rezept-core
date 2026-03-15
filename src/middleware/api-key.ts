import { type DefaultAppContext, type RequestInfo, requestInfo } from 'rwsdk/worker';
import { getApiKeyByKey } from '@/repositories/api-keys';

export default async function apiKeyMiddleware({ ctx, request }: RequestInfo<DefaultAppContext>) {
	const authHeader = request.headers.get('Authorization');
	if (!authHeader?.startsWith('Bearer ')) {
		return;
	}

	const key = authHeader.slice(7);

	try {
		const apiKey = await getApiKeyByKey(key);

		if (apiKey.revokeAt && new Date(apiKey.revokeAt) < new Date()) {
			return new Response(JSON.stringify({ success: false, errors: { _form: ['API key has been revoked'] } }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
			});
		}

		const now = Date.now();
		ctx.session = { userId: apiKey.userId, createdAt: now, lastAccessedAt: now };
		ctx.apiKey = apiKey;
	} catch (err) {
		requestInfo.ctx.logger.warn(`Error in API middleware: ${err}`);
		return new Response(JSON.stringify({ success: false, errors: { _form: ['Invalid API key'] } }), {
			status: 403,
			headers: { 'Content-Type': 'application/json' },
		});
	}
}
