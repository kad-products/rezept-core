import debug from 'rwsdk/debug';
import { route } from 'rwsdk/router';
import { sessions } from '@/session/store';
import { Login } from './pages/Login.js';

const log = debug('passkey:routes');

export function authRoutes() {
	log('Setting up authentication routes');
	return [
		route('/login', Login),
		route('/logout', async ({ request }) => {
			const headers = new Headers();
			await sessions.remove(request, headers);
			headers.set('Location', '/');

			return new Response(null, {
				status: 302,
				headers,
			});
		}),
	];
}
