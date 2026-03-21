import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';

const corsConfig: Record<string, string[]> = {
	'/api/recipes/imports/scrapes': ['POST'],
};

export default function corsMiddleware({ request, response }: RequestInfo<DefaultAppContext>) {
	const method = request.method;
	const path = new URL(request.url).pathname;

	const originHeader = request.headers.get('Origin');

	if (originHeader && Object.keys(corsConfig).includes(path)) {
		if (method === 'OPTIONS') {
			return new Response(null, {
				status: 204,
				headers: {
					'Access-Control-Allow-Origin': originHeader,
					'Access-Control-Allow-Credentials': 'true',
					'Access-Control-Allow-Methods': 'POST, OPTIONS',
					'Access-Control-Allow-Headers': 'Content-Type, Authorization',
				},
			});
		} else {
			const allowedMethods: string[] = ['OPTIONS'];
			if (corsConfig[path]) {
				allowedMethods.push(...corsConfig[path]);
			}
			response.headers.append('Access-Control-Allow-Origin', originHeader);
			response.headers.append('Access-Control-Allow-Credentials', 'true');
			response.headers.append('Access-Control-Allow-Methods', allowedMethods.join(', '));
			response.headers.append('Access-Control-Allow-Headers', 'Content-Type');
		}
	}
}
