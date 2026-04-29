import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { sessions } from '@/durable-objects/store';
import { getUserById } from '@/repositories/users';

export default async function userMiddleware({ ctx, request }: RequestInfo<DefaultAppContext>): Promise<Response | undefined> {
	if (ctx.session?.userId) {
		try {
			ctx.user = await getUserById(ctx.session.userId, ctx.logger);
		} catch (err) {
			ctx.logger.error(`Error fetching current user: ${err}`);
			const headers = new Headers();
			await sessions.remove(request, headers);
			headers.set('Location', '/');

			return Response.json(
				{
					message: 'User found on session but could not be retrieved',
				},
				{
					status: 302,
					headers,
				},
			);
		}
	}
}
