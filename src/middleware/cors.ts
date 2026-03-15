import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';

const allowedCorsPaths: Record<string, string[]> = {
	OPTIONS: ['/api/recipes/import/bookmarklet'],
};

export default function corsMiddleware({ request }: RequestInfo<DefaultAppContext>) {
	const allowedPaths = allowedCorsPaths[request.method];

	if (allowedPaths) {
		if (allowedPaths.includes(new URL(request.url).pathname)) {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': request.headers.get('Origin') ?? '*',
					'Access-Control-Allow-Credentials': 'true',
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			});
		}
	}
}
