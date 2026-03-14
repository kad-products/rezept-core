import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';

function getCorsHeaders(request: Request) {
	return {
		'Access-Control-Allow-Origin': request.headers.get('Origin') ?? '*',
		'Access-Control-Allow-Credentials': 'true',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	};
}

async function handler({ request, ctx }: RequestInfo<DefaultAppContext>) {
	const userId = ctx.user?.id;

	const corsHeaders = getCorsHeaders(request);

	if (!userId) {
		return Response.json({ success: false, errors: { _form: ['You must be logged in'] } }, { status: 401, headers: corsHeaders });
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ success: false, errors: { _form: ['Invalid JSON body'] } }, { status: 400, headers: corsHeaders });
	}

	ctx.logger.info(`Bookmarklet import payload: ${JSON.stringify(body, null, 2)}`);

	return Response.json({ success: true }, { headers: corsHeaders });
}

function optionsHandler({ request }: RequestInfo<DefaultAppContext>) {
	return new Response(null, { status: 204, headers: getCorsHeaders(request) });
}

export default { post: handler, options: optionsHandler };
