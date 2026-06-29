import { route } from 'rwsdk/router';
import type { RequestInfo } from 'rwsdk/worker';
import { sessions } from '@/durable-objects';
import { requirePermissions } from '@/interrupters';
import Pages__auth__login from './login';

async function logoutRedirect({ request }: RequestInfo): Promise<Response> {
	const headers = new Headers();
	await sessions.remove(request, headers);
	headers.set('Location', '/');

	return new Response(null, {
		status: 302,
		headers,
	});
}

export default {
	app: [route('/login', [requirePermissions('auth:login'), Pages__auth__login]), route('/logout', [logoutRedirect])],
};
