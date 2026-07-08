import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RzStepError } from '@/classes';
import { createNoopLogger } from '@/logger';

const mockImagesBucket = vi.hoisted(() => ({
	put: vi.fn(),
}));

vi.mock('cloudflare:workers', () => ({
	env: { REZEPT_IMAGES: mockImagesBucket },
}));

vi.mock('@/repositories', () => ({
	getImageTypeByName: vi.fn(),
	createImage: vi.fn(),
}));

import { createImage, getImageTypeByName } from '@/repositories';
import { fetchAndStoreCoverImage } from '@/steps';
import type { ImageDBRead, ImageTypeDBRead, ParsedRecipeScrapeImage } from '@/types';

const logger = createNoopLogger();
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

	describe('failure handling', () => {
		it('throws non-retryable RzStepError for 4xx responses', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 403 })));

			const err = await fetchAndStoreCoverImage(baseCoverImage, userId, logger).catch(e => e);

			expect(err).toBeInstanceOf(RzStepError);
			expect(err.retryable).toBe(false);
			expect(createImage).not.toHaveBeenCalled();
			vi.unstubAllGlobals();
		});

		it('throws retryable RzStepError for 5xx responses', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

			const err = await fetchAndStoreCoverImage(baseCoverImage, userId, logger).catch(e => e);

			expect(err).toBeInstanceOf(RzStepError);
			expect(err.retryable).toBe(true);
			expect(createImage).not.toHaveBeenCalled();
			vi.unstubAllGlobals();
		});

		it('throws retryable RzStepError for 408 and 429 responses', async () => {
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 429 })));

			const err = await fetchAndStoreCoverImage(baseCoverImage, userId, logger).catch(e => e);

			expect(err).toBeInstanceOf(RzStepError);
			expect(err.retryable).toBe(true);
			vi.unstubAllGlobals();
		});

		it('throws RzStepError when fetch throws a network error', async () => {
			vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network timeout')));

			const err = await fetchAndStoreCoverImage(baseCoverImage, userId, logger).catch(e => e);

			expect(err).toBeInstanceOf(RzStepError);
			expect(err.retryable).toBe(true);
			expect(createImage).not.toHaveBeenCalled();
			vi.unstubAllGlobals();
		});

		it('throws RzStepError when creating the DB record fails', async () => {
			const buffer = new ArrayBuffer(512);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer)));
			vi.mocked(createImage).mockRejectedValueOnce(new Error('DB error'));

			const err = await fetchAndStoreCoverImage(baseCoverImage, userId, logger).catch(e => e);

			expect(err).toBeInstanceOf(RzStepError);
			expect(err.retryable).toBe(true);
			expect(mockImagesBucket.put).not.toHaveBeenCalled();
			vi.unstubAllGlobals();
		});

		it('throws RzStepError when R2 put fails, after DB record is created', async () => {
			const buffer = new ArrayBuffer(512);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer)));
			mockImagesBucket.put.mockRejectedValueOnce(new Error('R2 unavailable'));

			const err = await fetchAndStoreCoverImage(baseCoverImage, userId, logger).catch(e => e);

			expect(err).toBeInstanceOf(RzStepError);
			expect(err.retryable).toBe(true);
			expect(createImage).toHaveBeenCalledTimes(1);
			vi.unstubAllGlobals();
		});

		it('throws RzStepError when getImageTypeByName fails', async () => {
			const buffer = new ArrayBuffer(512);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer)));
			vi.mocked(getImageTypeByName).mockRejectedValueOnce(new Error('type not found'));

			const err = await fetchAndStoreCoverImage(baseCoverImage, userId, logger).catch(e => e);

			expect(err).toBeInstanceOf(RzStepError);
			expect(err.retryable).toBe(true);
			vi.unstubAllGlobals();
		});

		it('throws RzStepError when fetch throws a non-Error value', async () => {
			vi.stubGlobal('fetch', vi.fn().mockRejectedValue('network string error'));

			const err = await fetchAndStoreCoverImage(baseCoverImage, userId, logger).catch(e => e);

			expect(err).toBeInstanceOf(RzStepError);
			vi.unstubAllGlobals();
		});

		it('throws RzStepError when createImage throws a non-Error value', async () => {
			const buffer = new ArrayBuffer(512);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer)));
			vi.mocked(createImage).mockRejectedValueOnce('DB string error');

			const err = await fetchAndStoreCoverImage(baseCoverImage, userId, logger).catch(e => e);

			expect(err).toBeInstanceOf(RzStepError);
			vi.unstubAllGlobals();
		});

		it('throws RzStepError when R2 put throws a non-Error value', async () => {
			const buffer = new ArrayBuffer(512);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer)));
			mockImagesBucket.put.mockRejectedValueOnce('R2 string error');

			const err = await fetchAndStoreCoverImage(baseCoverImage, userId, logger).catch(e => e);

			expect(err).toBeInstanceOf(RzStepError);
			vi.unstubAllGlobals();
		});
	});

	describe('deriveImageName', () => {
		it('falls back to "image" name and filename when the URL cannot be parsed', async () => {
			const buffer = new ArrayBuffer(512);
			vi.stubGlobal('fetch', vi.fn().mockResolvedValue(makeOkResponse(buffer)));

			await fetchAndStoreCoverImage({ url: 'not-a-valid-url' }, userId, logger);

			expect(createImage).toHaveBeenCalledWith(
				expect.objectContaining({ name: 'image', originalFilename: 'image' }),
				userId,
				logger,
			);
			vi.unstubAllGlobals();
		});
	});
});
