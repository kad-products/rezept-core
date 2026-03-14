import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';

export default function bookmarkletCorsMiddleware({ request }: RequestInfo<DefaultAppContext>) {
	console.log('bookmarkletCorsMiddleware handling OPTIONS');
	if (request.method === 'OPTIONS' && new URL(request.url).pathname === '/api/recipes/import/bookmarklet') {
		return new Response(null, {
			status: 204,
			headers: {
				'Access-Control-Allow-Origin': request.headers.get('Origin') ?? '*',
				'Access-Control-Allow-Credentials': 'true',
				'Access-Control-Allow-Methods': 'POST, OPTIONS',
				'Access-Control-Allow-Headers': 'Content-Type',
			},
		});
	}
}
