import { env } from 'cloudflare:workers';
import { route } from 'rwsdk/router';
import type { RequestInfo } from 'rwsdk/worker';

// Test bridge — only active in development, never in production.
// Exposes a /_test endpoint that the vitest-pool-workers test suite uses
// to invoke server-side functions without going through the normal client flow.
// To add callable functions, pass them in the second argument of handleVitestRequest
// and call them from tests via vitestInvoke('functionName').
export default env.REZEPT_ENV === 'development'
	? [
			route('/_test', {
				post: async ({ request }: RequestInfo) => {
					const { handleVitestRequest } = await import('rwsdk-community/worker');
					return handleVitestRequest(request, {});
				},
			}),
		]
	: [];
