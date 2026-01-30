import { prefix, render, route } from 'rwsdk/router';
import { defineApp } from 'rwsdk/worker';

import { Document } from '@/Document';
import { setCommonHeaders } from '@/headers';
import type { User } from '@/models/schema';
import listRoutes from '@/pages/lists/routes';
import profileRoutes from '@/pages/profile/routes';
import recipeRoutes from '@/pages/recipes/routes';
import { authRoutes } from '@/passkey/routes';
import { setupPasskeyAuth } from '@/passkey/setup';
import { getUserById } from '@/repositories/users';
import type { Session } from '@/session/durableObject';
import { sessions } from '@/session/store';

import Pages__root from './pages/root';

export type AppContext = {
	session?: Session | null;
	user?: User | undefined;
};
export { SessionDurableObject } from '@/session/durableObject';

export default defineApp([
	setCommonHeaders(),
	setupPasskeyAuth(),
	async ({ ctx, request }) => {
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
	},
	render(Document, [
		route('/', Pages__root),

		prefix('/auth', authRoutes()),
		prefix('/lists', listRoutes),
		prefix('/profile', profileRoutes),
		prefix('/recipes', recipeRoutes),
	]),
]);
