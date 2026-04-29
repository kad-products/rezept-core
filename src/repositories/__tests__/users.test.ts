import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import { resetDb } from '../../../tests/mocks/db';
import { createUser, getUserById } from '../users';

const logger = new Logger();

beforeEach(async () => {
	await resetDb();
});

describe('createUser', () => {
	it('creates a user with username', async () => {
		const user = await createUser('johndoe', logger);

		expect(user.username).toBe('johndoe');
		expect(user.id).toBeDefined();
		expect(user.createdAt).toBeDefined();
	});

	it('creates unique IDs for each user', async () => {
		const user1 = await createUser('alice', logger);
		const user2 = await createUser('bob', logger);

		expect(user1.id).not.toBe(user2.id);
	});

	it('creates users with different usernames', async () => {
		const user1 = await createUser('alice', logger);
		const user2 = await createUser('bob', logger);

		expect(user1.username).toBe('alice');
		expect(user2.username).toBe('bob');
	});

	it('sets createdAt timestamp', async () => {
		const beforeCreate = new Date().toISOString();
		const user = await createUser('testuser', logger);
		const afterCreate = new Date().toISOString();

		expect(user.createdAt).toBeDefined();
		expect(user.createdAt >= beforeCreate).toBe(true);
		expect(user.createdAt <= afterCreate).toBe(true);
	});

	it('throws on duplicate username', async () => {
		await createUser('duplicate', logger);

		await expect(createUser('duplicate', logger)).rejects.toThrow();
	});

	it('handles usernames with special characters', async () => {
		const user = await createUser('user_name-123', logger);

		expect(user.username).toBe('user_name-123');
	});

	it('handles empty string username', async () => {
		// Depending on your validation, this might succeed or fail
		// Adjust based on your actual requirements
		const user = await createUser('', logger);

		expect(user.username).toBe('');
	});

	it('handles very long usernames', async () => {
		const longUsername = 'a'.repeat(100);
		const user = await createUser(longUsername, logger);

		expect(user.username).toBe(longUsername);
	});

	it('returns user with all expected fields', async () => {
		const user = await createUser('testuser', logger);

		expect(user).toHaveProperty('id');
		expect(user).toHaveProperty('username');
		expect(user).toHaveProperty('createdAt');
		expect(user).toHaveProperty('updatedAt');
	});
});

describe('getUserById', () => {
	it('returns user when found', async () => {
		const created = await createUser('testuser', logger);
		const found = await getUserById(created.id, logger);

		expect(found).toEqual(created);
	});

	it('returns user with correct username', async () => {
		const created = await createUser('specificuser', logger);
		const found = await getUserById(created.id, logger);

		expect(found?.username).toBe('specificuser');
	});

	it('throws when user not found', async () => {
		const nonexistentId = crypto.randomUUID();

		await expect(getUserById(nonexistentId, logger)).rejects.toThrow();
	});

	it('throws with descriptive error message when user not found', async () => {
		const nonexistentId = crypto.randomUUID();

		await expect(getUserById(nonexistentId, logger)).rejects.toThrow(/matchedUsers length is 0/);
	});

	it('returns correct user when multiple users exist', async () => {
		const _user1 = await createUser('alice', logger);
		const user2 = await createUser('bob', logger);
		const _user3 = await createUser('charlie', logger);

		const found = await getUserById(user2.id, logger);

		expect(found?.username).toBe('bob');
		expect(found?.id).toBe(user2.id);
	});

	it('returns user with valid UUID', async () => {
		const created = await createUser('testuser', logger);
		const found = await getUserById(created.id, logger);

		// UUID format validation
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		expect(found?.id).toMatch(uuidRegex);
	});

	it('preserves all user fields', async () => {
		const created = await createUser('fulltest', logger);
		const found = await getUserById(created.id, logger);

		expect(found?.id).toBe(created.id);
		expect(found?.username).toBe(created.username);
		expect(found?.createdAt).toBe(created.createdAt);
		expect(found?.updatedAt).toBe(created.updatedAt);
	});

	it('handles invalid UUID format gracefully', async () => {
		// Depending on your DB, this might throw or return undefined
		// Adjust based on actual behavior
		await expect(getUserById('not-a-uuid', logger)).rejects.toThrow();
	});
});

describe('integration: createUser and getUserById', () => {
	it('can create and retrieve user in sequence', async () => {
		const created = await createUser('integration-test', logger);
		const retrieved = await getUserById(created.id, logger);

		expect(retrieved).toEqual(created);
	});

	it('can create multiple users and retrieve each one', async () => {
		const users = await Promise.all([createUser('user1', logger), createUser('user2', logger), createUser('user3', logger)]);

		for (const user of users) {
			const found = await getUserById(user.id, logger);
			expect(found).toEqual(user);
		}
	});

	it('maintains data integrity across operations', async () => {
		const user1 = await createUser('first', logger);
		const user2 = await createUser('second', logger);

		const found1 = await getUserById(user1.id, logger);
		const found2 = await getUserById(user2.id, logger);

		// Ensure we got the right users back
		expect(found1?.username).toBe('first');
		expect(found2?.username).toBe('second');

		// Ensure IDs haven't changed
		expect(found1?.id).toBe(user1.id);
		expect(found2?.id).toBe(user2.id);
	});
});
