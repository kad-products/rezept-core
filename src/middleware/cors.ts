import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';

const allowedCorsPaths: Record<string, string[]> = {
	OPTIONS: ['/api/recipes/scrape'],
};

export default function corsMiddleware({ request }: RequestInfo<DefaultAppContext>) {
	const method = request.method;
	const path = new URL(request.url).pathname;
	const allowedPaths = allowedCorsPaths[method];
	if (allowedPaths?.includes(path)) {
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
