import { beforeEach, describe, expect, it, vi } from 'vitest';
import Logger from '@/logger';

const mockEnv = vi.hoisted(() => ({
	rezept_images: {
		get: vi.fn(),
	},
}));

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

import handler, { _getHandler } from '../images';

const makeR2Object = (contentType?: string) => ({
	body: new ReadableStream(),
	httpMetadata: contentType ? { contentType } : {},
});

describe('_getHandler', () => {
	let ctx: { logger: InstanceType<typeof Logger> };

	beforeEach(() => {
		vi.clearAllMocks();
		ctx = { logger: new Logger() };
	});

	it('returns 200 with the R2 object body when the image exists', async () => {
		mockEnv.rezept_images.get.mockResolvedValue(makeR2Object('image/png'));
		const response = await _getHandler({ params: { imageId: 'abc123' }, ctx } as any);
		expect(response.status).toBe(200);
	});

	it('returns the Content-Type from R2 metadata', async () => {
		mockEnv.rezept_images.get.mockResolvedValue(makeR2Object('image/webp'));
		const response = await _getHandler({ params: { imageId: 'abc123' }, ctx } as any);
		expect(response.headers.get('Content-Type')).toBe('image/webp');
	});

	it('falls back to application/octet-stream when R2 metadata has no contentType', async () => {
		mockEnv.rezept_images.get.mockResolvedValue(makeR2Object());
		const response = await _getHandler({ params: { imageId: 'abc123' }, ctx } as any);
		expect(response.headers.get('Content-Type')).toBe('application/octet-stream');
	});

	it('sets a long-lived immutable Cache-Control header', async () => {
		mockEnv.rezept_images.get.mockResolvedValue(makeR2Object('image/png'));
		const response = await _getHandler({ params: { imageId: 'abc123' }, ctx } as any);
		expect(response.headers.get('Cache-Control')).toBe('public, max-age=31536000, immutable');
	});

	it('returns 404 when the image does not exist in R2', async () => {
		mockEnv.rezept_images.get.mockResolvedValue(null);
		const response = await _getHandler({ params: { imageId: 'missing' }, ctx } as any);
		expect(response.status).toBe(404);
	});

	it('fetches the image using the imageId from params', async () => {
		mockEnv.rezept_images.get.mockResolvedValue(makeR2Object('image/jpeg'));
		await _getHandler({ params: { imageId: 'img-xyz' }, ctx } as any);
		expect(mockEnv.rezept_images.get).toHaveBeenCalledWith('img-xyz');
	});

	it('propagates R2 errors', async () => {
		mockEnv.rezept_images.get.mockRejectedValue(new Error('R2 unavailable'));
		await expect(_getHandler({ params: { imageId: 'abc123' }, ctx } as any)).rejects.toThrow('R2 unavailable');
	});
});

describe('route handler', () => {
	it('handler chain ends with _getHandler', () => {
		expect(handler.get[handler.get.length - 1]).toBe(_getHandler);
	});
});
