import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { requirePermissions } from '@/middleware/permissions';
import { recipeFormSchema } from '@/schemas';
import { parseJsonLd } from '@/utils/parse-jsonld';

function getCorsHeaders(request: Request) {
	return {
		'Access-Control-Allow-Origin': request.headers.get('Origin') ?? '*',
		'Access-Control-Allow-Credentials': 'true',
		'Access-Control-Allow-Methods': 'POST, OPTIONS',
		'Access-Control-Allow-Headers': 'Content-Type',
	};
}

async function postHandler({ request, ctx }: RequestInfo<DefaultAppContext>) {
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

	try {
		const parsedPayload = parseJsonLd(body as { url: string; jsonld: unknown[] });
		ctx.logger.info(`Parsed payload: ${JSON.stringify(parsedPayload, null, 2)}`);
		const parsed = recipeFormSchema.safeParse(parsedPayload);

		if (parsed.error) {
			return Response.json(
				{
					success: false,
					errors: parsed.error.flatten().fieldErrors,
				},
				{ status: 400, headers: corsHeaders },
			);
		}

		ctx.logger.info(`Validated form data: ${JSON.stringify(parsed, null, 4)} `);
	} catch (err) {
		ctx.logger.warn(`Error parsing JSON-LD payload: ${err}`);
		ctx.logger.info(`Original scrape payload: ${JSON.stringify(body, null, 2)}`);
	}

	return Response.json({ success: true }, { headers: corsHeaders });
}

function optionsHandler({ request }: RequestInfo<DefaultAppContext>) {
	console.log('optionsHandler handling OPTIONS');
	return new Response(null, { status: 204, headers: getCorsHeaders(request) });
}

export default {
	post: [requirePermissions('recipes:scrape'), postHandler] as const,
	options: optionsHandler,
};
