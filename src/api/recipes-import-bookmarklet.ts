import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';

const CORS_HEADERS = {
	'Access-Control-Allow-Origin': '*',
	'Access-Control-Allow-Methods': 'POST, OPTIONS',
	'Access-Control-Allow-Headers': 'Content-Type',
};

async function handler({ request, ctx }: RequestInfo<DefaultAppContext>) {
	const userId = ctx.user?.id;

	if (!userId) {
		return Response.json(
			{ success: false, errors: { _form: ['You must be logged in'] } },
			{ status: 401, headers: CORS_HEADERS },
		);
	}

	let body: unknown;
	try {
		body = await request.json();
	} catch {
		return Response.json({ success: false, errors: { _form: ['Invalid JSON body'] } }, { status: 400, headers: CORS_HEADERS });
	}

	ctx.logger.info(`Bookmarklet import payload: ${JSON.stringify(body, null, 2)}`);

	return Response.json({ success: true }, { headers: CORS_HEADERS });
}

export default { post: handler };
