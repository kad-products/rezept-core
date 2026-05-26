import { env } from 'cloudflare:workers';
import type { RequestInfo } from 'rwsdk/worker';

export default {
	get: [_getHandler] as const,
};

/**
 * @private - exported for testing only, do not use directly
 */
export async function _getHandler({ params, ctx }: RequestInfo): Promise<Response> {
	const imageId = params.imageId;
	ctx.logger.debug(`Fetching image ${imageId}`);

	const obj = await env.rezept_images.get(imageId);

	if (!obj) {
		ctx.logger.debug(`Image ${imageId} not found`);
		return new Response('Not Found', { status: 404 });
	}

	return new Response(obj.body, {
		headers: {
			'Content-Type': obj.httpMetadata?.contentType ?? 'application/octet-stream',
			'Cache-Control': 'public, max-age=31536000, immutable',
		},
	});
}
