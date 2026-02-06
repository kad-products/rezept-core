import { route } from 'rwsdk/router';
import { sessions } from '@/session/store';
import Pages__auth__login from './login';

export default [
	route('/login', Pages__auth__login),
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
