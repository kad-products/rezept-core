import { env } from 'cloudflare:workers';
import type RzLogger from '@/logger';
import { createImage, getImageTypeByName } from '@/repositories';
import type { ImageDBRead, ParsedRecipeScrapeImage } from '@/types';

export async function fetchAndStoreCoverImage(
	coverImage: ParsedRecipeScrapeImage | undefined,
	userId: string,
	logger: RzLogger,
): Promise<ImageDBRead | null> {
	if (!coverImage) {
		logger.debug('No cover image in scrape payload');
		return null;
	}

	let buffer: ArrayBuffer;
	let mimeType: string;

	try {
		logger.debug(`Fetching cover image from ${coverImage.url}`);
		const response = await fetch(coverImage.url);

		if (!response.ok) {
			logger.warn(`Cover image fetch failed: HTTP ${response.status} for ${coverImage.url}`);
			return null;
		}

		buffer = await response.arrayBuffer();
		mimeType = response.headers.get('content-type')?.split(';')[0].trim() ?? 'application/octet-stream';
	} catch (err) {
		logger.warn(`Cover image fetch error for ${coverImage.url}: ${err}`);
		return null;
	}

	const { name, originalFilename } = deriveImageName(coverImage.url);
	const fileSize = buffer.byteLength;

	let image: ImageDBRead;
	try {
		const imageType = await getImageTypeByName('RECIPE_COVER_IMAGE', logger);
		image = await createImage(
			{
				imageTypeId: imageType.id,
				name,
				originalFilename,
				mimeType,
				fileSize,
				width: coverImage.width ?? null,
				height: coverImage.height ?? null,
			},
			userId,
			logger,
		);
	} catch (err) {
		logger.warn(`Failed to create cover image DB record: ${err}`);
		return null;
	}

	try {
		await env.rezept_images.put(image.id, buffer, { httpMetadata: { contentType: mimeType } });
		logger.info(`Cover image stored: ${image.id}`);
	} catch (err) {
		logger.warn(`Cover image DB record ${image.id} created but R2 store failed: ${err}`);
		return null;
	}

	return image;
}

//  _     _ _______ _____        _______
//  |     |    |      |   |      |______
//  |_____|    |    __|__ |_____ ______|
//

function deriveImageName(url: string): { name: string; originalFilename: string } {
	try {
		const pathname = new URL(url).pathname;
		const lastSegment = pathname.split('/').filter(Boolean).pop() ?? 'image';
		const originalFilename = decodeURIComponent(lastSegment);
		const withoutExtension = originalFilename.replace(/\.[^.]+$/, '');
		const name =
			withoutExtension
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, '-')
				.replace(/^-+|-+$/g, '') || 'image';
		return { name, originalFilename };
	} catch {
		return { name: 'image', originalFilename: 'image' };
	}
}
