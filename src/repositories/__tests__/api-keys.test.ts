import { beforeEach, describe, expect, it, vi } from 'vitest';
import type RzLogger from '@/logger';
import Logger from '@/logger';
import { createUser } from '@/repositories/users';
import { resetDb } from '../../../tests/mocks/db';
import { createApiKey, getApiKeyById, getApiKeysByUserId, updateApiKey } from '../api-keys';

// Mock env
vi.mock('cloudflare:workers', () => ({
	env: { REZEPT_ENV: 'test' },
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
		logger: new Logger(),
	},
};

vi.mock('rwsdk/worker', () => ({
	serverAction: (action: any) => {
		// If called with middleware array, return the last element (the actual handler)
		return Array.isArray(action) ? action[action.length - 1] : action;
	},
	get requestInfo() {
		return mockRequestInfo;
	},
}));

const baseApiKeyData = {
	name: 'Test API Key',
	permissions: ['recipes:import'],
};

describe('api-keys repository', () => {
	let testUserId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser');
		testUserId = user.id;
	});

	describe('getApiKeysByUserId', () => {
		it('returns empty array when user has no api keys', async () => {
			const result = await getApiKeysByUserId(testUserId);
			expect(result).toEqual([]);
		});

		it('returns all api keys for user', async () => {
			await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 1' }, testUserId);
			await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 2' }, testUserId);
			await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 3' }, testUserId);

			const result = await getApiKeysByUserId(testUserId);
			expect(result).toHaveLength(3);
		});

		it('only returns keys for the specified user', async () => {
			const otherUser = await createUser('otheruser');
			await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId);
			await createApiKey({ ...baseApiKeyData, userId: otherUser.id }, otherUser.id);

			const result = await getApiKeysByUserId(testUserId);
			expect(result).toHaveLength(1);
			expect(result[0].userId).toBe(testUserId);
		});

		it('returns keys with correct shape', async () => {
			await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId);

			const result = await getApiKeysByUserId(testUserId);
			expect(result[0]).toMatchObject({
				name: 'Test API Key',
				permissions: ['recipes:import'],
				userId: testUserId,
			});
		});
	});

	describe('getApiKeyById', () => {
		it('returns api key by id', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId);

			const result = await getApiKeyById(created.id);
			expect(result.id).toBe(created.id);
			expect(result.name).toBe('Test API Key');
		});

		it('throws when api key does not exist', async () => {
			await expect(getApiKeyById(crypto.randomUUID())).rejects.toThrow('getApiKeyById: matchedAPIKeys length is 0 for id');
		});

		it('returns correct key when multiple exist', async () => {
			await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 1' }, testUserId);
			const key2 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 2' }, testUserId);

			const result = await getApiKeyById(key2.id);
			expect(result.id).toBe(key2.id);
			expect(result.name).toBe('Key 2');
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(getApiKeyById('not-a-uuid')).rejects.toThrow('Invalid id: not-a-uuid');
		});

		it('throws when id is an empty string', async () => {
			await expect(getApiKeyById('')).rejects.toThrow('Invalid id:');
		});
	});

	describe('createApiKey', () => {
		it('creates an api key with required fields', async () => {
			const result = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId);

			expect(result.id).toBeDefined();
			expect(result.name).toBe('Test API Key');
			expect(result.permissions).toEqual(['recipes:import']);
			expect(result.userId).toBe(testUserId);
		});

		it('sets audit fields correctly', async () => {
			const result = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId);

			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeNull();
			expect(result.deletedAt).toBeNull();
		});

		it('creates key with multiple permissions', async () => {
			const result = await createApiKey(
				{ ...baseApiKeyData, userId: testUserId, permissions: ['recipes:import', 'recipes:read'] },
				testUserId,
			);

			expect(result.permissions).toEqual(['recipes:import', 'recipes:read']);
		});

		it('creates key with empty permissions', async () => {
			const result = await createApiKey({ ...baseApiKeyData, userId: testUserId, permissions: [] }, testUserId);

			expect(result.permissions).toEqual([]);
		});

		it('creates key with revokeAt', async () => {
			const revokeAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
			const result = await createApiKey({ ...baseApiKeyData, userId: testUserId, revokeAt }, testUserId);

			expect(result.revokeAt).toBeDefined();
		});

		it('creates key without revokeAt', async () => {
			const result = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId);
			expect(result.revokeAt).toBeNull();
		});

		it('generates a key with correct format', async () => {
			const result = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId);

			expect(result.apiKey).toMatch(/^rz_std_[0-9a-f]{64}$/);
		});

		it('generates unique keys for each api key', async () => {
			const key1 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 1' }, testUserId);
			const key2 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 2' }, testUserId);

			expect(key1.apiKey).not.toBe(key2.apiKey);
		});

		it('creates multiple keys with unique ids', async () => {
			const key1 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 1' }, testUserId);
			const key2 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 2' }, testUserId);

			expect(key1.id).not.toBe(key2.id);
		});
	});

	describe('updateApiKey', () => {
		it('updates api key fields', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId);

			const result = await updateApiKey(created.id, { ...baseApiKeyData, userId: testUserId, name: 'Updated Name' }, testUserId);

			expect(result.name).toBe('Updated Name');
		});

		it('updates permissions', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId);

			const result = await updateApiKey(
				created.id,
				{ ...baseApiKeyData, userId: testUserId, permissions: ['recipes:import', 'recipes:read'] },
				testUserId,
			);

			expect(result.permissions).toEqual(['recipes:import', 'recipes:read']);
		});

		it('sets updatedBy to userId', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId);

			const result = await updateApiKey(created.id, { ...baseApiKeyData, userId: testUserId }, testUserId);
			expect(result.updatedBy).toBe(testUserId);
		});

		it('sets updatedAt on update', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId);

			await new Promise(resolve => setTimeout(resolve, 10));

			const result = await updateApiKey(created.id, { ...baseApiKeyData, userId: testUserId }, testUserId);
			expect(result.updatedAt).toBeDefined();
			expect(result.updatedAt).not.toBe(created.createdAt);
		});

		it('throws for non-existent api key', async () => {
			await expect(updateApiKey(crypto.randomUUID(), { ...baseApiKeyData, userId: testUserId }, testUserId)).rejects.toThrow(
				'updateApiKey: updated 0 records instead of 1',
			);
		});

		it('does not affect other api keys', async () => {
			const key1 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 1' }, testUserId);
			const key2 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 2' }, testUserId);

			await updateApiKey(key1.id, { ...baseApiKeyData, userId: testUserId, name: 'Updated' }, testUserId);

			const unchanged = await getApiKeyById(key2.id);
			expect(unchanged.name).toBe('Key 2');
		});
	});
});
