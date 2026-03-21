import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { requirePermissions } from '@/middleware/permissions';
import { createRecipeScrape, updateRecipeScrapeStatus } from '@/repositories/recipe-scrapes';
import { recipeFormSchema } from '@/schemas';
import type { RecipeScrape } from '@/types';
import { parseJsonLd } from '@/utils/parse-jsonld';

export default {
	post: [requirePermissions('recipes:scrape'), postHandler] as const,
	options: optionsHandler,
};

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

	//  _____ __   _ _____ _______ _____ _______        _____ ______ _______      _______ _______  ______ _______  _____  _______
	//    |   | \  |   |      |      |   |_____| |        |    ____/ |______      |______ |       |_____/ |_____| |_____] |______
	//  __|__ |  \_| __|__    |    __|__ |     | |_____ __|__ /_____ |______      ______| |_____  |    \_ |     | |       |______
	//
	let recipeScrape: RecipeScrape;
	try {
		recipeScrape = await createRecipeScrape(JSON.stringify(body), userId);
	} catch (err) {
		return Response.json(
			{
				success: false,
				errors: [(err as Error).message],
			},
			{ status: 400, headers: corsHeaders },
		);
	}

	//  ______   _____  ______  __   __      _______  _____        ______ _______ _______ _____  _____  _______
	//  |_____] |     | |     \   \_/           |    |     |      |_____/ |______ |         |   |_____] |______
	//  |_____] |_____| |_____/    |            |    |_____|      |    \_ |______ |_____  __|__ |       |______
	//
	try {
		const parsedPayload = parseJsonLd(body as { url: string; jsonld: unknown[] });
		ctx.logger.info(`Parsed payload: ${JSON.stringify(parsedPayload, null, 2)}`);
		const parsed = recipeFormSchema.safeParse({ authorId: userId, ...parsedPayload });

		if (parsed.error) {
			ctx.logger.warn(`Schema parsing found error in JSON-LD payload: ${JSON.stringify(parsed.error.flatten().fieldErrors)}`);
			ctx.logger.info(`Original scrape payload: ${JSON.stringify(body, null, 2)}`);
			await updateRecipeScrapeStatus(recipeScrape.id, 'FAILED', JSON.stringify(parsed.error.flatten().fieldErrors), userId);
			return Response.json(
				{
					success: false,
					errors: parsed.error.flatten().fieldErrors,
				},
				{ status: 400, headers: corsHeaders },
			);
		}

		ctx.logger.info(`Validated form data: ${JSON.stringify(parsed, null, 4)} `);
		await updateRecipeScrapeStatus(recipeScrape.id, 'PROCESSING', 'Parsed recipe JSON successfully', userId);
	} catch (err) {
		ctx.logger.warn(`Unexpected error during parsing JSON-LD payload: ${err}`);
		ctx.logger.info(`Original scrape payload: ${JSON.stringify(body, null, 2)}`);
		await updateRecipeScrapeStatus(recipeScrape.id, 'FAILED', (err as Error).message, userId);
	}

	// save recipe
	// sections
	// ingredients
	// instructions

	return Response.json({ success: true }, { headers: corsHeaders });
}

function optionsHandler({ request }: RequestInfo<DefaultAppContext>) {
	console.log('optionsHandler handling OPTIONS');
	return new Response(null, { status: 204, headers: getCorsHeaders(request) });
}
