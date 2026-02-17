import { beforeEach, describe, expect, it } from 'vitest';
import { createTestDb } from '../../../tests/setup';
import type { TestableDB } from '../../types';
import { createUser, getUserById } from '../users';

let testDb: TestableDB;

beforeEach(async () => {
	testDb = await createTestDb();
});

describe('createUser', () => {
	it('creates a user with username', async () => {
		const user = await createUser('johndoe', testDb);

		expect(user.username).toBe('johndoe');
		expect(user.id).toBeDefined();
		expect(user.createdAt).toBeDefined();
	});

	it('creates unique IDs for each user', async () => {
		const user1 = await createUser('alice', testDb);
		const user2 = await createUser('bob', testDb);

		expect(user1.id).not.toBe(user2.id);
	});

	it('creates users with different usernames', async () => {
		const user1 = await createUser('alice', testDb);
		const user2 = await createUser('bob', testDb);

		expect(user1.username).toBe('alice');
		expect(user2.username).toBe('bob');
	});

	it('sets createdAt timestamp', async () => {
		const beforeCreate = new Date().toISOString();
		const user = await createUser('testuser', testDb);
		const afterCreate = new Date().toISOString();

		expect(user.createdAt).toBeDefined();
		expect(user.createdAt >= beforeCreate).toBe(true);
		expect(user.createdAt <= afterCreate).toBe(true);
	});

	it('throws on duplicate username', async () => {
		await createUser('duplicate', testDb);

		await expect(createUser('duplicate', testDb)).rejects.toThrow();
	});

	it('handles usernames with special characters', async () => {
		const user = await createUser('user_name-123', testDb);

		expect(user.username).toBe('user_name-123');
	});

	it('handles empty string username', async () => {
		// Depending on your validation, this might succeed or fail
		// Adjust based on your actual requirements
		const user = await createUser('', testDb);

		expect(user.username).toBe('');
	});

	it('handles very long usernames', async () => {
		const longUsername = 'a'.repeat(100);
		const user = await createUser(longUsername, testDb);

		expect(user.username).toBe(longUsername);
	});

	it('returns user with all expected fields', async () => {
		const user = await createUser('testuser', testDb);

		expect(user).toHaveProperty('id');
		expect(user).toHaveProperty('username');
		expect(user).toHaveProperty('createdAt');
		expect(user).toHaveProperty('updatedAt');
	});
});

describe('getUserById', () => {
	it('returns user when found', async () => {
		const created = await createUser('testuser', testDb);
		const found = await getUserById(created.id, testDb);

		expect(found).toEqual(created);
	});

	it('returns user with correct username', async () => {
		const created = await createUser('specificuser', testDb);
		const found = await getUserById(created.id, testDb);

		expect(found?.username).toBe('specificuser');
	});

	it('throws when user not found', async () => {
		const nonexistentId = crypto.randomUUID();

		await expect(getUserById(nonexistentId, testDb)).rejects.toThrow();
	});

	it('throws with descriptive error message when user not found', async () => {
		const nonexistentId = crypto.randomUUID();

		await expect(getUserById(nonexistentId, testDb)).rejects.toThrow(/matchedUsers length is 0/);
	});

	it('returns correct user when multiple users exist', async () => {
		const _user1 = await createUser('alice', testDb);
		const user2 = await createUser('bob', testDb);
		const _user3 = await createUser('charlie', testDb);

		const found = await getUserById(user2.id, testDb);

		expect(found?.username).toBe('bob');
		expect(found?.id).toBe(user2.id);
	});

	it('returns user with valid UUID', async () => {
		const created = await createUser('testuser', testDb);
		const found = await getUserById(created.id, testDb);

		// UUID format validation
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		expect(found?.id).toMatch(uuidRegex);
	});

	it('preserves all user fields', async () => {
		const created = await createUser('fulltest', testDb);
		const found = await getUserById(created.id, testDb);

		expect(found?.id).toBe(created.id);
		expect(found?.username).toBe(created.username);
		expect(found?.createdAt).toBe(created.createdAt);
		expect(found?.updatedAt).toBe(created.updatedAt);
	});

	it('handles invalid UUID format gracefully', async () => {
		// Depending on your DB, this might throw or return undefined
		// Adjust based on actual behavior
		await expect(getUserById('not-a-uuid', testDb)).rejects.toThrow();
	});
});

describe('integration: createUser and getUserById', () => {
	it('can create and retrieve user in sequence', async () => {
		const created = await createUser('integration-test', testDb);
		const retrieved = await getUserById(created.id, testDb);

		expect(retrieved).toEqual(created);
	});

	it('can create multiple users and retrieve each one', async () => {
		const users = await Promise.all([createUser('user1', testDb), createUser('user2', testDb), createUser('user3', testDb)]);

		for (const user of users) {
			const found = await getUserById(user.id, testDb);
			expect(found).toEqual(user);
		}
	});

	it('maintains data integrity across operations', async () => {
		const user1 = await createUser('first', testDb);
		const user2 = await createUser('second', testDb);

		const found1 = await getUserById(user1.id, testDb);
		const found2 = await getUserById(user2.id, testDb);

		// Ensure we got the right users back
		expect(found1?.username).toBe('first');
		expect(found2?.username).toBe('second');

		// Ensure IDs haven't changed
		expect(found1?.id).toBe(user1.id);
		expect(found2?.id).toBe(user2.id);
	});
});
