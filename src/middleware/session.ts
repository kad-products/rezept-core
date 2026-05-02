import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { ErrorResponse } from 'rwsdk/worker';
import { sessions } from '@/durable-objects/store';

export default async function sessionMiddleware({
	ctx,
	request,
	response,
}: RequestInfo<DefaultAppContext>): Promise<Response | undefined> {
	try {
		ctx.session = await sessions.load(request);
	} catch (error) {
		if (error instanceof ErrorResponse && error.code === 401) {
			await sessions.remove(request, response.headers);
			response.headers.set('Location', '/auth/login');

			return new Response(null, {
				status: 302,
				headers: response.headers,
			});
		}

		throw error;
	}
}
