import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { getUserById } from '@/repositories/users';
import { sessions } from '@/session/store';

export default async function userMiddleware({ ctx, request }: RequestInfo<DefaultAppContext>) {
	if (ctx.session?.userId) {
		try {
			ctx.user = await getUserById(ctx.session.userId);
		} catch (err) {
			console.log(`Error fetching current user: ${err}`);
			const headers = new Headers();
			await sessions.remove(request, headers);
			headers.set('Location', '/');

			return new Response(null, {
				status: 302,
				headers,
			});
		}
	}
}
