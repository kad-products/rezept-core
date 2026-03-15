import { beforeEach, describe, expect, it, vi } from 'vitest';
import type RzLogger from '@/logger';
import Logger from '@/logger';
import { getApiKeyById, getApiKeysByUserId } from '@/repositories/api-keys';
import { createUser } from '@/repositories/users';
import { resetDb } from '../../../tests/mocks/db';

vi.mock('cloudflare:workers', () => ({
	env: { REZEPT_ENV: 'test' },
}));

interface MockRequestInfo {
	ctx: {
		user: { id: string } | null;
		logger: RzLogger;
	};
}

const mockRequestInfo: MockRequestInfo = {
	ctx: {
		user: { id: 'test-user-id' },
		logger: new Logger(),
	},
};

vi.mock('rwsdk/worker', () => ({
	get requestInfo() {
		return mockRequestInfo;
	},
	serverAction: (handlers: any[]) => handlers[handlers.length - 1],
}));

import { _saveApiKey } from '../api-keys';

const baseApiKeyData = {
	name: 'Test API Key',
	userId: 'test-user-id',
	permissions: ['recipes:import'],
};

describe('saveApiKey integration', () => {
	let testUserId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser');
		testUserId = user.id;
		mockRequestInfo.ctx.user = { id: testUserId };
	});

	describe('create api key', () => {
		it('creates api key and persists to database', async () => {
			const result = await _saveApiKey({ ...baseApiKeyData, userId: testUserId });

			expect(result.success).toBe(true);
			expect(result.data?.id).toBeDefined();

			if (result.data?.id) {
				const apiKey = await getApiKeyById(result.data.id);
				expect(apiKey).toBeDefined();
				expect(apiKey.name).toBe('Test API Key');
				expect(apiKey.permissions).toEqual(['recipes:import']);
				expect(apiKey.userId).toBe(testUserId);
			}
		});

		it('generates a properly formatted api key', async () => {
			const result = await _saveApiKey({ ...baseApiKeyData, userId: testUserId });

			expect(result.success).toBe(true);
			expect(result.data?.apiKey).toMatch(/^rz_std_[0-9a-f]{64}$/);
		});

		it('validates data before saving', async () => {
			const result = await _saveApiKey({} as any);

			expect(result.success).toBe(false);
			expect(result.data).toBeUndefined();

			const keys = await getApiKeysByUserId(testUserId);
			expect(keys).toHaveLength(0);
		});

		it('sets audit fields correctly', async () => {
			const result = await _saveApiKey({ ...baseApiKeyData, userId: testUserId });

			expect(result.success).toBe(true);
			expect(result.data?.id).toBeDefined();

			if (result.data?.id) {
				const apiKey = await getApiKeyById(result.data.id);
				expect(apiKey.createdBy).toBe(testUserId);
				expect(apiKey.createdAt).toBeDefined();
				expect(apiKey.updatedAt).toBeNull();
				expect(apiKey.deletedAt).toBeNull();
			}
		});

		it('creates api key with revokeAt', async () => {
			const revokeAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
			const result = await _saveApiKey({ ...baseApiKeyData, userId: testUserId, revokeAt });

			expect(result.success).toBe(true);
			expect(result.data?.id).toBeDefined();

			if (result.data?.id) {
				const apiKey = await getApiKeyById(result.data.id);
				expect(apiKey.revokeAt).toBeDefined();
			}
		});

		it('creates api key without revokeAt', async () => {
			const result = await _saveApiKey({ ...baseApiKeyData, userId: testUserId });

			expect(result.success).toBe(true);
			expect(result.data?.id).toBeDefined();

			if (result.data?.id) {
				const apiKey = await getApiKeyById(result.data.id);
				expect(apiKey.revokeAt).toBeNull();
			}
		});

		it('requires authentication', async () => {
			mockRequestInfo.ctx.user = null;

			const result = await _saveApiKey({ ...baseApiKeyData, userId: testUserId });

			expect(result.success).toBe(false);

			const keys = await getApiKeysByUserId(testUserId);
			expect(keys).toHaveLength(0);
		});

		it('generates unique keys for concurrent creates', async () => {
			const promises = Array.from({ length: 5 }, (_, i) =>
				_saveApiKey({ ...baseApiKeyData, userId: testUserId, name: `Key ${i}` }),
			);

			const results = await Promise.all(promises);

			expect(results.every(r => r.success)).toBe(true);

			const apiKeys = results.map(r => r.data?.apiKey).filter(Boolean);
			const uniqueKeys = new Set(apiKeys);
			expect(uniqueKeys.size).toBe(5);
		});
	});

	describe('update api key', () => {
		it('updates existing api key in database', async () => {
			const createResult = await _saveApiKey({ ...baseApiKeyData, userId: testUserId });

			expect(createResult.success).toBe(true);
			expect(createResult.data?.id).toBeDefined();

			if (createResult.data?.id) {
				const apiKeyId = createResult.data.id;

				const updateResult = await _saveApiKey({
					...baseApiKeyData,
					userId: testUserId,
					id: apiKeyId,
					name: 'Updated Name',
					permissions: ['recipes:import', 'recipes:read'],
				});

				expect(updateResult.success).toBe(true);
				expect(updateResult.data?.id).toBe(apiKeyId);

				const apiKey = await getApiKeyById(apiKeyId);
				expect(apiKey.name).toBe('Updated Name');
				expect(apiKey.permissions).toEqual(['recipes:import', 'recipes:read']);
			}
		});

		it('sets audit fields on update', async () => {
			const createResult = await _saveApiKey({ ...baseApiKeyData, userId: testUserId });

			expect(createResult.success).toBe(true);
			expect(createResult.data?.id).toBeDefined();

			if (createResult.data?.id) {
				const apiKeyId = createResult.data.id;

				await new Promise(resolve => setTimeout(resolve, 10));

				await _saveApiKey({
					...baseApiKeyData,
					userId: testUserId,
					id: apiKeyId,
					name: 'Updated Name',
				});

				const apiKey = await getApiKeyById(apiKeyId);
				expect(apiKey.updatedBy).toBe(testUserId);
				expect(apiKey.updatedAt).toBeDefined();
				expect(apiKey.updatedAt).not.toBe(apiKey.createdAt);
			}
		});

		it('does not change the api key value on update', async () => {
			const createResult = await _saveApiKey({ ...baseApiKeyData, userId: testUserId });

			expect(createResult.success).toBe(true);
			expect(createResult.data?.id).toBeDefined();

			if (createResult.data?.id) {
				const apiKeyId = createResult.data.id;
				const originalKey = createResult.data.apiKey;

				await _saveApiKey({
					...baseApiKeyData,
					userId: testUserId,
					id: apiKeyId,
					name: 'Updated Name',
				});

				const apiKey = await getApiKeyById(apiKeyId);
				expect(apiKey.apiKey).toBe(originalKey);
			}
		});
	});
});
