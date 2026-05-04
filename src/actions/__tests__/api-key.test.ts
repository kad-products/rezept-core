import { beforeEach, describe, expect, it, vi } from 'vitest';
import type RzLogger from '@/logger';
import Logger from '@/logger';

const mockEnv = vi.hoisted(() => ({ REZEPT_ENV: 'development' as string }));
const capturedChain = vi.hoisted(() => ({ handlers: [] as unknown[] }));

// Mock repositories
vi.mock('@/repositories', () => ({
	createApiKey: vi.fn(),
	updateApiKey: vi.fn(),
}));

// Mock env
vi.mock('cloudflare:workers', () => ({
	env: mockEnv,
}));

interface MockRequestInfo {
	ctx: {
		user: { id: string } | null;
		logger: RzLogger;
	};
}

const mockRequestInfo: MockRequestInfo = {
	ctx: {
		user: {
			id: randomUUID(),
		},
		logger: new Logger(),
	},
};

vi.mock('rwsdk/worker', () => ({
	get requestInfo() {
		return mockRequestInfo;
	},
	serverAction: (handlers: unknown[]) => {
		capturedChain.handlers = handlers;
		return handlers[handlers.length - 1];
	},
}));

import { randomUUID } from 'node:crypto';
import { requireAuthentication } from '@/interrupters';
import { createApiKey, updateApiKey } from '@/repositories';
import type { ApiKeyFormInput } from '@/types';
import { _saveApiKey } from '../api-keys';

const baseApiKeyData: Pick<ApiKeyFormInput, 'name' | 'userId' | 'permissions'> = {
	name: 'Test API Key',
	userId: randomUUID(),
	permissions: ['recipes:upload'],
};

const mockApiKey = {
	id: 'mock-api-key-id',
	...baseApiKeyData,
	apiKey: 'rz_std_abc123',
	createdAt: new Date().toISOString(),
	updatedAt: null,
	deletedAt: null,
};

describe('_saveApiKey', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx.user = { id: 'test-user-id' };
		mockEnv.REZEPT_ENV = 'development';

		vi.mocked(createApiKey).mockResolvedValue(mockApiKey as any);
		vi.mocked(updateApiKey).mockResolvedValue(mockApiKey as any);
	});

	describe('authentication', () => {
		it('includes requireAuthentication in the serverAction chain', () => {
			expect(capturedChain.handlers).toContain(requireAuthentication);
		});
	});

	describe('create api key', () => {
		it('creates api key with valid data', async () => {
			const result = await _saveApiKey(baseApiKeyData);

			expect(result.success).toBe(true);
			expect(createApiKey).toHaveBeenCalledTimes(1);
			expect(createApiKey).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'Test API Key',
					permissions: ['recipes:upload'],
				}),
				'test-user-id',
				expect.anything(),
			);
		});

		it('validates required fields', async () => {
			const result = await _saveApiKey({} as any);

			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(createApiKey).not.toHaveBeenCalled();
		});

		it('creates api key with multiple permissions', async () => {
			const result = await _saveApiKey({
				...baseApiKeyData,
				permissions: ['recipes:upload', 'recipes:read'],
			});

			expect(result.success).toBe(true);
			expect(createApiKey).toHaveBeenCalledWith(
				expect.objectContaining({ permissions: ['recipes:upload', 'recipes:read'] }),
				'test-user-id',
				expect.anything(),
			);
		});

		it('creates api key with revokeAt', async () => {
			const revokeAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();

			const result = await _saveApiKey({ ...baseApiKeyData, revokeAt });

			expect(result.success).toBe(true);
			expect(createApiKey).toHaveBeenCalledWith(expect.objectContaining({ revokeAt }), 'test-user-id', expect.anything());
		});

		it('handles repository errors gracefully', async () => {
			vi.mocked(createApiKey).mockRejectedValueOnce(new Error('Database error'));

			const result = await _saveApiKey(baseApiKeyData);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('hides error details in non-development environments', async () => {
			vi.mocked(createApiKey).mockRejectedValueOnce(new Error('Connection failed: postgres://user:password@db.internal'));
			mockEnv.REZEPT_ENV = 'production';
			const result = await _saveApiKey(baseApiKeyData);

			expect(result.errors?._form?.[0]).toBe('Failed to save item');
			expect(result.errors?._form?.[0]).not.toContain('postgres://');
			expect(result.errors?._form?.[0]).not.toContain('password');
		});

		it('returns created api key on success', async () => {
			const result = await _saveApiKey(baseApiKeyData);

			expect(result.success).toBe(true);
			expect(result.data).toMatchObject({ id: 'mock-api-key-id' });
		});
	});

	describe('update api key', () => {
		it('updates api key with valid data', async () => {
			const apiKeyId = randomUUID();
			const data = { ...baseApiKeyData, id: apiKeyId };

			const result = await _saveApiKey(data);

			expect(result.success).toBe(true);
			expect(updateApiKey).toHaveBeenCalledTimes(1);
			expect(updateApiKey).toHaveBeenCalledWith(
				apiKeyId,
				expect.objectContaining({
					name: 'Test API Key',
					permissions: ['recipes:upload'],
				}),
				'test-user-id',
				expect.anything(),
			);
		});

		it('does not call createApiKey when updating', async () => {
			const data = { ...baseApiKeyData, id: randomUUID() };

			await _saveApiKey(data);

			expect(createApiKey).not.toHaveBeenCalled();
		});

		it('updates permissions', async () => {
			const data = {
				...baseApiKeyData,
				id: randomUUID(),
				permissions: ['recipes:upload', 'recipes:read'] as ApiKeyFormInput['permissions'],
			};

			const result = await _saveApiKey(data);

			expect(result.success).toBe(true);
			expect(updateApiKey).toHaveBeenCalledWith(
				data.id,
				expect.objectContaining({ permissions: ['recipes:upload', 'recipes:read'] }),
				'test-user-id',
				expect.anything(),
			);
		});

		it('handles update repository errors', async () => {
			vi.mocked(updateApiKey).mockRejectedValueOnce(new Error('Update failed'));

			const result = await _saveApiKey({ ...baseApiKeyData, id: randomUUID() });

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('returns updated api key on success', async () => {
			const result = await _saveApiKey({ ...baseApiKeyData, id: randomUUID() });

			expect(result.success).toBe(true);
			expect(result.data).toMatchObject({ id: 'mock-api-key-id' });
		});
	});
});
