import { beforeEach, describe, expect, it } from 'vitest';
import { createNoopLogger } from '@/logger';
import { createUser } from '@/repositories';
import type { ApiKeyFormInput } from '@/types';
import { resetDb } from '../../../tests/mocks/db';
import { createApiKey, deleteApiKey, getApiKeyById, getApiKeyByKey, getApiKeysByUserId, updateApiKey } from '../api-keys';

const logger = createNoopLogger();

const baseApiKeyData: Pick<ApiKeyFormInput, 'name' | 'permissions'> = {
	name: 'Test API Key',
	permissions: ['recipes:upload'],
};

describe('api-keys repository', () => {
	let testUserId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		testUserId = user.id;
	});

	describe('getApiKeysByUserId', () => {
		it('returns empty array when user has no api keys', async () => {
			const result = await getApiKeysByUserId(testUserId, logger);
			expect(result).toEqual([]);
		});

		it('returns all api keys for user', async () => {
			await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 1' }, testUserId, logger);
			await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 2' }, testUserId, logger);
			await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 3' }, testUserId, logger);

			const result = await getApiKeysByUserId(testUserId, logger);
			expect(result).toHaveLength(3);
		});

		it('only returns keys for the specified user', async () => {
			const otherUser = await createUser('otheruser', null, logger);
			await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);
			await createApiKey({ ...baseApiKeyData, userId: otherUser.id }, otherUser.id, logger);

			const result = await getApiKeysByUserId(testUserId, logger);
			expect(result).toHaveLength(1);
			expect(result[0].userId).toBe(testUserId);
		});

		it('returns keys with correct shape', async () => {
			await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);

			const result = await getApiKeysByUserId(testUserId, logger);
			expect(result[0]).toMatchObject({
				name: 'Test API Key',
				permissions: ['recipes:upload'],
				userId: testUserId,
			});
		});
	});

	describe('getApiKeyById', () => {
		it('returns api key by id', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);

			const result = await getApiKeyById(created.id, logger);
			expect(result.id).toBe(created.id);
			expect(result.name).toBe('Test API Key');
		});

		it('throws when api key does not exist', async () => {
			await expect(getApiKeyById(crypto.randomUUID(), logger)).rejects.toThrow('Expected 1 ApiKey record(s), but found 0');
		});

		it('returns correct key when multiple exist', async () => {
			await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 1' }, testUserId, logger);
			const key2 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 2' }, testUserId, logger);

			const result = await getApiKeyById(key2.id, logger);
			expect(result.id).toBe(key2.id);
			expect(result.name).toBe('Key 2');
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(getApiKeyById('not-a-uuid', logger)).rejects.toThrow('The value "not-a-uuid" is not a valid ID for a ApiKey');
		});

		it('throws when id is an empty string', async () => {
			await expect(getApiKeyById('', logger)).rejects.toThrow('The value "" is not a valid ID for a ApiKey');
		});
	});

	describe('createApiKey', () => {
		it('creates an api key with required fields', async () => {
			const result = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);

			expect(result.id).toBeDefined();
			expect(result.name).toBe('Test API Key');
			expect(result.permissions).toEqual(['recipes:upload']);
			expect(result.userId).toBe(testUserId);
		});

		it('sets audit fields correctly', async () => {
			const result = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);

			expect(result.createdAt).toBeDefined();
			expect(result.updatedAt).toBeNull();
			expect(result.deletedAt).toBeNull();
		});

		it('creates key with multiple permissions', async () => {
			const result = await createApiKey(
				{ ...baseApiKeyData, userId: testUserId, permissions: ['recipes:upload', 'recipes:read'] },
				testUserId,
				logger,
			);

			expect(result.permissions).toEqual(['recipes:upload', 'recipes:read']);
		});

		it('creates key with empty permissions', async () => {
			const result = await createApiKey(
				{ ...baseApiKeyData, userId: testUserId, permissions: [] as ApiKeyFormInput['permissions'] },
				testUserId,
				logger,
			);

			expect(result.permissions).toEqual([]);
		});

		it('creates key with revokeAt', async () => {
			const revokeAt = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
			const result = await createApiKey({ ...baseApiKeyData, userId: testUserId, revokeAt }, testUserId, logger);

			expect(result.revokeAt).toBeDefined();
		});

		it('creates key without revokeAt', async () => {
			const result = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);
			expect(result.revokeAt).toBeNull();
		});

		it('generates a key with correct format', async () => {
			const result = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);

			expect(result.apiKey).toMatch(/^rz_std_[0-9a-f]{64}$/);
		});

		it('generates unique keys for each api key', async () => {
			const key1 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 1' }, testUserId, logger);
			const key2 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 2' }, testUserId, logger);

			expect(key1.apiKey).not.toBe(key2.apiKey);
		});

		it('creates multiple keys with unique ids', async () => {
			const key1 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 1' }, testUserId, logger);
			const key2 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 2' }, testUserId, logger);

			expect(key1.id).not.toBe(key2.id);
		});
	});

	describe('getApiKeyByKey', () => {
		it('returns api key by key string', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);

			const result = await getApiKeyByKey(created.apiKey, logger);
			expect(result.id).toBe(created.id);
			expect(result.apiKey).toBe(created.apiKey);
		});

		it('returns correct key when multiple exist', async () => {
			await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 1' }, testUserId, logger);
			const target = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 2' }, testUserId, logger);

			const result = await getApiKeyByKey(target.apiKey, logger);
			expect(result.id).toBe(target.id);
			expect(result.name).toBe('Key 2');
		});

		it('throws when key does not exist', async () => {
			await expect(getApiKeyByKey('rz_std_nonexistent', logger)).rejects.toThrow('Expected 1 ApiKey record(s), but found 0');
		});

		it('searches by apiKey value not internal id', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);

			// Looking up by the apiKey string value finds it
			const found = await getApiKeyByKey(created.apiKey, logger);
			expect(found).toBeDefined();

			// Looking up by internal id should not find it
			await expect(getApiKeyByKey(created.id, logger)).rejects.toThrow('Expected 1 ApiKey record(s), but found 0');
		});
	});

	describe('deleteApiKey', () => {
		it('soft-deletes the key and returns it with deletedAt set', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);

			const deleted = await deleteApiKey(created.id, testUserId, logger);

			expect(deleted.id).toBe(created.id);
			expect(deleted.deletedAt).not.toBeNull();
			expect(deleted.deletedBy).toBe(testUserId);
		});

		it('does not return deleted key from getApiKeysByUserId', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);
			await deleteApiKey(created.id, testUserId, logger);

			const result = await getApiKeysByUserId(testUserId, logger);
			expect(result).toHaveLength(0);
		});

		it('throws when key does not exist', async () => {
			await expect(deleteApiKey(crypto.randomUUID(), testUserId, logger)).rejects.toThrow(
				'Expected 1 ApiKey record(s), but found 0',
			);
		});

		it('throws when id is not a valid uuid', async () => {
			await expect(deleteApiKey('not-a-uuid', testUserId, logger)).rejects.toThrow(
				'The value "not-a-uuid" is not a valid ID for a ApiKey',
			);
		});
	});

	describe('updateApiKey', () => {
		it('updates api key fields', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);

			const result = await updateApiKey(
				created.id,
				{ ...baseApiKeyData, userId: testUserId, name: 'Updated Name' },
				testUserId,
				logger,
			);

			expect(result.name).toBe('Updated Name');
		});

		it('updates permissions', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);

			const result = await updateApiKey(
				created.id,
				{ ...baseApiKeyData, userId: testUserId, permissions: ['recipes:upload', 'recipes:read'] },
				testUserId,
				logger,
			);

			expect(result.permissions).toEqual(['recipes:upload', 'recipes:read']);
		});

		it('sets updatedBy to userId', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);

			const result = await updateApiKey(created.id, { ...baseApiKeyData, userId: testUserId }, testUserId, logger);
			expect(result.updatedBy).toBe(testUserId);
		});

		it('sets updatedAt on update', async () => {
			const created = await createApiKey({ ...baseApiKeyData, userId: testUserId }, testUserId, logger);

			await new Promise(resolve => setTimeout(resolve, 10));

			const result = await updateApiKey(created.id, { ...baseApiKeyData, userId: testUserId }, testUserId, logger);
			expect(result.updatedAt).toBeDefined();
			expect(result.updatedAt).not.toBe(created.createdAt);
		});

		it('throws for non-existent api key', async () => {
			await expect(
				updateApiKey(crypto.randomUUID(), { ...baseApiKeyData, userId: testUserId }, testUserId, logger),
			).rejects.toThrow('Expected 1 ApiKey record(s), but found 0');
		});

		it('does not affect other api keys', async () => {
			const key1 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 1' }, testUserId, logger);
			const key2 = await createApiKey({ ...baseApiKeyData, userId: testUserId, name: 'Key 2' }, testUserId, logger);

			await updateApiKey(key1.id, { ...baseApiKeyData, userId: testUserId, name: 'Updated' }, testUserId, logger);

			const unchanged = await getApiKeyById(key2.id, logger);
			expect(unchanged.name).toBe('Key 2');
		});
	});
});
