import { beforeEach, describe, expect, it, vi } from 'vitest';
import Logger from '@/logger';

const mockImagesBucket = vi.hoisted(() => ({
	put: vi.fn(),
}));

vi.mock('cloudflare:workers', () => ({
	env: { rezept_images: mockImagesBucket },
}));

vi.mock('@/repositories', () => ({
	getImageTypeByName: vi.fn(),
	createImage: vi.fn(),
}));

import { createImage, getImageTypeByName } from '@/repositories';
import { fetchAndStoreCoverImage } from '@/steps';
import type { ImageDBRead, ImageTypeDBRead, ParsedRecipeScrapeImage } from '@/types';

const logger = new Logger();
const userId = '00000000-0000-0000-0000-000000000001';

const mockImageType = { id: 'type-001', name: 'RECIPE_COVER_IMAGE' } as unknown as ImageTypeDBRead;
const mockImage = { id: 'image-001', name: 'corn-chowder', mimeType: 'image/jpeg' } as unknown as ImageDBRead;

const baseCoverImage: ParsedRecipeScrapeImage = {
	url: 'https://example.com/images/corn-chowder.jpg',
	width: 1500,
	height: 1125,
};

function makeOkResponse(body: ArrayBuffer, contentType = 'image/jpeg'): Response {
	return new Response(body, {
		status: 200,
		headers: { 'content-type': contentType },
	});
}

describe('fetchAndStoreCoverImage', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getImageTypeByName).mockResolvedValue(mockImageType);
		vi.mocked(createImage).mockResolvedValue(mockImage);
		mockImagesBucket.put.mockResolvedValue(undefined);
	});

	describe('when no cover image is provided', () => {
		it('returns null without making any calls', async () => {
			const result = await fetchAndStoreCoverImage(undefined, userId, logger);

			expect(result).toBeNull();
			expect(getImageTypeByName).not.toHaveBeenCalled();
			expect(createImage).not.toHaveBeenCalled();
			expect(mockImagesBucket.put).not.toHaveBeenCalled();
		});
	});

	describe('successful fetch and store', () => {
		it('returns the created image record', async () => {
			const buffer = new ArrayBuffer(1024);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer)));

			const result = await fetchAndStoreCoverImage(baseCoverImage, userId, logger);

			expect(result).toBe(mockImage);
			vi.unstubAllGlobals();
		});

		it('creates the image DB record with correct fields', async () => {
			const buffer = new ArrayBuffer(2048);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer, 'image/jpeg')));

			await fetchAndStoreCoverImage(baseCoverImage, userId, logger);

			expect(createImage).toHaveBeenCalledWith(
				expect.objectContaining({
					imageTypeId: mockImageType.id,
					mimeType: 'image/jpeg',
					fileSize: 2048,
					width: 1500,
					height: 1125,
				}),
				userId,
				logger,
			);
			vi.unstubAllGlobals();
		});

		it('stores the image to R2 using the image id as key', async () => {
			const buffer = new ArrayBuffer(1024);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer)));

			await fetchAndStoreCoverImage(baseCoverImage, userId, logger);

			expect(mockImagesBucket.put).toHaveBeenCalledWith(
				mockImage.id,
				buffer,
				expect.objectContaining({ httpMetadata: { contentType: 'image/jpeg' } }),
			);
			vi.unstubAllGlobals();
		});

		it('derives image name as a slug from the URL filename', async () => {
			const buffer = new ArrayBuffer(512);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer)));

			await fetchAndStoreCoverImage({ url: 'https://example.com/images/Grandma_s-Corn-Chowder_2025.jpg' }, userId, logger);

			expect(createImage).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'grandma-s-corn-chowder-2025',
					originalFilename: 'Grandma_s-Corn-Chowder_2025.jpg',
				}),
				userId,
				logger,
			);
			vi.unstubAllGlobals();
		});

		it('uses null for width/height when not provided', async () => {
			const buffer = new ArrayBuffer(512);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer)));

			await fetchAndStoreCoverImage({ url: 'https://example.com/images/photo.jpg' }, userId, logger);

			expect(createImage).toHaveBeenCalledWith(expect.objectContaining({ width: null, height: null }), userId, logger);
			vi.unstubAllGlobals();
		});

		it('strips content-type params when setting mimeType', async () => {
			const buffer = new ArrayBuffer(512);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer, 'image/webp; charset=utf-8')));

			await fetchAndStoreCoverImage(baseCoverImage, userId, logger);

			expect(createImage).toHaveBeenCalledWith(expect.objectContaining({ mimeType: 'image/webp' }), userId, logger);
			vi.unstubAllGlobals();
		});
	});

	describe('failure handling — non-fatal', () => {
		it('returns null when fetch returns a non-200 status', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 403 })));

			const result = await fetchAndStoreCoverImage(baseCoverImage, userId, logger);

			expect(result).toBeNull();
			expect(createImage).not.toHaveBeenCalled();
			vi.unstubAllGlobals();
		});

		it('returns null when fetch throws a network error', async () => {
			vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network timeout')));

			const result = await fetchAndStoreCoverImage(baseCoverImage, userId, logger);

			expect(result).toBeNull();
			expect(createImage).not.toHaveBeenCalled();
			vi.unstubAllGlobals();
		});

		it('returns null when creating the DB record fails', async () => {
			const buffer = new ArrayBuffer(512);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer)));
			vi.mocked(createImage).mockRejectedValueOnce(new Error('DB error'));

			const result = await fetchAndStoreCoverImage(baseCoverImage, userId, logger);

			expect(result).toBeNull();
			expect(mockImagesBucket.put).not.toHaveBeenCalled();
			vi.unstubAllGlobals();
		});

		it('returns null when R2 put fails, after DB record is created', async () => {
			const buffer = new ArrayBuffer(512);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer)));
			mockImagesBucket.put.mockRejectedValueOnce(new Error('R2 unavailable'));

			const result = await fetchAndStoreCoverImage(baseCoverImage, userId, logger);

			expect(result).toBeNull();
			// DB record was still created
			expect(createImage).toHaveBeenCalledTimes(1);
			vi.unstubAllGlobals();
		});

		it('returns null when getImageTypeByName fails', async () => {
			const buffer = new ArrayBuffer(512);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer)));
			vi.mocked(getImageTypeByName).mockRejectedValueOnce(new Error('type not found'));

			const result = await fetchAndStoreCoverImage(baseCoverImage, userId, logger);

			expect(result).toBeNull();
			vi.unstubAllGlobals();
		});
	});
});
