import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNoopLogger } from '@/logger';
import type { RzLogger } from '@/types';

vi.mock('@/analytics', () => ({
	trackApiKeyUsed: vi.fn(),
}));

vi.mock('@/repositories', () => ({
	getApiKeyByKey: vi.fn(),
}));

interface MockRequestInfo {
	ctx: {
		user: { id: string } | null;
		logger: RzLogger;
	};
}

// Mock rwsdk/worker
const mockRequestInfo: MockRequestInfo = {
	ctx: {
		user: {
			id: 'test-user-id',
		},
		logger: createNoopLogger(),
	},
};

vi.mock('rwsdk/worker', () => ({
	get requestInfo() {
		return mockRequestInfo;
	},
}));

import { trackApiKeyUsed } from '@/analytics';
import { getApiKeyByKey } from '@/repositories';
import apiKeyMiddleware from '../api-key';

const mockApiKey = {
	id: 'mock-api-key-id',
	userId: 'test-user-id',
	name: 'Test Key',
	apiKey: 'rz_std_abc123',
	permissions: ['recipes:upload'],
	revokeAt: null,
	createdAt: new Date().toISOString(),
	updatedAt: null,
	deletedAt: null,
};

describe('apiKeyMiddleware', () => {
	let mockRequestInfo: any;

	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo = {
			ctx: { logger: createNoopLogger() },
			request: new Request('https://example.com/api/test'),
			response: { headers: new Headers() },
		};
	});

	describe('no authorization header', () => {
		it('passes through when no Authorization header is present', async () => {
			const result = await apiKeyMiddleware(mockRequestInfo);

			expect(result).toBeUndefined();
			expect(getApiKeyByKey).not.toHaveBeenCalled();
			expect(mockRequestInfo.ctx.session).toBeUndefined();
		});

		it('passes through when Authorization header is not Bearer', async () => {
			mockRequestInfo.request = new Request('https://example.com/api/test', {
				headers: { Authorization: 'Basic abc123' },
			});

			const result = await apiKeyMiddleware(mockRequestInfo);

			expect(result).toBeUndefined();
			expect(getApiKeyByKey).not.toHaveBeenCalled();
		});
	});

	describe('valid api key', () => {
		beforeEach(() => {
			mockRequestInfo.request = new Request('https://example.com/api/test', {
				headers: { Authorization: 'Bearer rz_std_abc123' },
			});
		});

		it('looks up the key from the Authorization header', async () => {
			vi.mocked(getApiKeyByKey).mockResolvedValue(mockApiKey as any);

			await apiKeyMiddleware(mockRequestInfo);

			expect(getApiKeyByKey).toHaveBeenCalledWith('rz_std_abc123', expect.anything());
		});

		it('sets session userId from api key', async () => {
			vi.mocked(getApiKeyByKey).mockResolvedValue(mockApiKey as any);

			await apiKeyMiddleware(mockRequestInfo);

			expect(mockRequestInfo.ctx.session?.userId).toBe('test-user-id');
		});

		it('sets session lastAccessedAt', async () => {
			vi.mocked(getApiKeyByKey).mockResolvedValue(mockApiKey as any);

			const before = Date.now();
			await apiKeyMiddleware(mockRequestInfo);
			const after = Date.now();

			expect(mockRequestInfo.ctx.session?.lastAccessedAt).toBeGreaterThanOrEqual(before);
			expect(mockRequestInfo.ctx.session?.lastAccessedAt).toBeLessThanOrEqual(after);
		});

		it('sets ctx.apiKey with the full key record', async () => {
			vi.mocked(getApiKeyByKey).mockResolvedValue(mockApiKey as any);

			await apiKeyMiddleware(mockRequestInfo);

			expect(mockRequestInfo.ctx.apiKey).toBe(mockApiKey);
		});
	});

	describe('invalid api key', () => {
		it('returns 403 when key is not found', async () => {
			mockRequestInfo.request = new Request('https://example.com/api/test', {
				headers: { Authorization: 'Bearer rz_std_invalid' },
			});
			vi.mocked(getApiKeyByKey).mockRejectedValue(new Error('getApiKeyByKey: matchedApiKeys length is 0'));

			const result = (await apiKeyMiddleware(mockRequestInfo)) as Response;

			expect(result).toBeInstanceOf(Response);
			expect(result.status).toBe(403);

			const body = (await result.json()) as { success: boolean; error: string };
			expect(body.success).toBe(false);
			expect(body.error).toContain('Invalid API key');
		});

		it('does not set session or apiKey on invalid key', async () => {
			mockRequestInfo.request = new Request('https://example.com/api/test', {
				headers: { Authorization: 'Bearer rz_std_invalid' },
			});
			vi.mocked(getApiKeyByKey).mockRejectedValue(new Error('not found'));

			await apiKeyMiddleware(mockRequestInfo);

			expect(mockRequestInfo.ctx.session).toBeUndefined();
			expect(mockRequestInfo.ctx.apiKey).toBeUndefined();
		});
	});

	describe('revoked api key', () => {
		it('returns 403 when key is past its revokeAt date', async () => {
			mockRequestInfo.request = new Request('https://example.com/api/test', {
				headers: { Authorization: 'Bearer rz_std_abc123' },
			});
			vi.mocked(getApiKeyByKey).mockResolvedValue({
				...mockApiKey,
				revokeAt: new Date(Date.now() - 1000).toISOString(),
			} as any);

			const result = (await apiKeyMiddleware(mockRequestInfo)) as Response;

			expect(result).toBeInstanceOf(Response);
			expect(result.status).toBe(403);

			const body = (await result.json()) as { success: boolean; error: string };
			expect(body.success).toBe(false);
			expect(body.error).toContain('API key has been revoked');
		});

		it('does not set session or apiKey on revoked key', async () => {
			mockRequestInfo.request = new Request('https://example.com/api/test', {
				headers: { Authorization: 'Bearer rz_std_abc123' },
			});
			vi.mocked(getApiKeyByKey).mockResolvedValue({
				...mockApiKey,
				revokeAt: new Date(Date.now() - 1000).toISOString(),
			} as any);

			await apiKeyMiddleware(mockRequestInfo);

			expect(mockRequestInfo.ctx.session).toBeUndefined();
			expect(mockRequestInfo.ctx.apiKey).toBeUndefined();
		});

		it('allows key that has not yet reached revokeAt', async () => {
			mockRequestInfo.request = new Request('https://example.com/api/test', {
				headers: { Authorization: 'Bearer rz_std_abc123' },
			});
			vi.mocked(getApiKeyByKey).mockResolvedValue({
				...mockApiKey,
				revokeAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
			} as any);

			const result = await apiKeyMiddleware(mockRequestInfo);

			expect(result).toBeUndefined();
			expect(mockRequestInfo.ctx.apiKey).toBeDefined();
		});

		it('allows key with no revokeAt', async () => {
			mockRequestInfo.request = new Request('https://example.com/api/test', {
				headers: { Authorization: 'Bearer rz_std_abc123' },
			});
			vi.mocked(getApiKeyByKey).mockResolvedValue(mockApiKey as any);

			const result = await apiKeyMiddleware(mockRequestInfo);

			expect(result).toBeUndefined();
			expect(mockRequestInfo.ctx.apiKey).toBeDefined();
		});
	});

	describe('analytics tracking', () => {
		it('tracks valid key usage with valid: true and the userId from the key', async () => {
			mockRequestInfo.request = new Request('https://example.com/api/recipes', {
				headers: { Authorization: 'Bearer rz_std_abc123' },
			});
			vi.mocked(getApiKeyByKey).mockResolvedValue(mockApiKey as any);

			await apiKeyMiddleware(mockRequestInfo);

			expect(trackApiKeyUsed).toHaveBeenCalledWith({
				userId: 'test-user-id',
				path: '/api/recipes',
				method: 'GET',
				valid: true,
			});
		});

		it('tracks invalid key usage with valid: false and userId "unknown"', async () => {
			mockRequestInfo.request = new Request('https://example.com/api/recipes', {
				headers: { Authorization: 'Bearer rz_std_invalid' },
			});
			vi.mocked(getApiKeyByKey).mockRejectedValue(new Error('not found'));

			await apiKeyMiddleware(mockRequestInfo);

			expect(trackApiKeyUsed).toHaveBeenCalledWith({
				userId: 'unknown',
				path: '/api/recipes',
				method: 'GET',
				valid: false,
			});
		});

		// Revoked keys return early before trackApiKeyUsed — we don't want to count a revoked
		// key as either valid or invalid since it's a distinct category.
		it('does not track revoked key usage', async () => {
			mockRequestInfo.request = new Request('https://example.com/api/recipes', {
				headers: { Authorization: 'Bearer rz_std_abc123' },
			});
			vi.mocked(getApiKeyByKey).mockResolvedValue({
				...mockApiKey,
				revokeAt: new Date(Date.now() - 1000).toISOString(),
			} as any);

			await apiKeyMiddleware(mockRequestInfo);

			expect(trackApiKeyUsed).not.toHaveBeenCalled();
		});

		it('includes the request method in the tracked data point', async () => {
			mockRequestInfo.request = new Request('https://example.com/api/recipes/import', {
				method: 'POST',
				headers: { Authorization: 'Bearer rz_std_abc123' },
			});
			vi.mocked(getApiKeyByKey).mockResolvedValue(mockApiKey as any);

			await apiKeyMiddleware(mockRequestInfo);

			expect(trackApiKeyUsed).toHaveBeenCalledWith(expect.objectContaining({ method: 'POST' }));
		});
	});
});
