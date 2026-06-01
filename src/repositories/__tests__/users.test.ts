import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import { resetDb } from '../../../tests/mocks/db';
import { createUser, deleteUser, getUserById, getUsers, updateUser } from '../users';

const logger = new Logger();

beforeEach(async () => {
	await resetDb();
});

describe('getUsers', () => {
	it('returns active users', async () => {
		const alice = await createUser('alice', null, logger);
		const bob = await createUser('bob', null, logger);

		const result = await getUsers(logger);
		const ids = result.map(u => u.id);

		expect(ids).toContain(alice.id);
		expect(ids).toContain(bob.id);
	});

	it('excludes deleted users by default', async () => {
		const deleted = await createUser('deleted', null, logger);
		await deleteUser(deleted.id, null, logger);

		const result = await getUsers(logger);

		expect(result.map(u => u.id)).not.toContain(deleted.id);
	});

	it('includes deleted users when includeDeleted is true', async () => {
		const active = await createUser('active', null, logger);
		const deleted = await createUser('deleted', null, logger);
		await deleteUser(deleted.id, null, logger);

		const result = await getUsers(logger, true);
		const ids = result.map(u => u.id);

		expect(ids).toContain(active.id);
		expect(ids).toContain(deleted.id);
	});
});

describe('createUser', () => {
	it('creates a user with username', async () => {
		const user = await createUser('johndoe', null, logger);

		expect(user.username).toBe('johndoe');
		expect(user.id).toBeDefined();
		expect(user.createdAt).toBeDefined();
	});

	it('creates unique IDs for each user', async () => {
		const user1 = await createUser('alice', null, logger);
		const user2 = await createUser('bob', null, logger);

		expect(user1.id).not.toBe(user2.id);
	});

	it('creates users with different usernames', async () => {
		const user1 = await createUser('alice', null, logger);
		const user2 = await createUser('bob', null, logger);

		expect(user1.username).toBe('alice');
		expect(user2.username).toBe('bob');
	});

	it('throws on duplicate username', async () => {
		await createUser('duplicate', null, logger);

		await expect(createUser('duplicate', null, logger)).rejects.toThrow();
	});

	it('handles usernames with special characters', async () => {
		const user = await createUser('user_name-123', null, logger);

		expect(user.username).toBe('user_name-123');
	});

	it('handles empty string username', async () => {
		// Depending on your validation, this might succeed or fail
		// Adjust based on your actual requirements
		const user = await createUser('', null, logger);

		expect(user.username).toBe('');
	});

	it('handles very long usernames', async () => {
		const longUsername = 'a'.repeat(100);
		const user = await createUser(longUsername, null, logger);

		expect(user.username).toBe(longUsername);
	});

	it('returns user with all expected fields', async () => {
		const user = await createUser('testuser', null, logger);

		expect(user).toHaveProperty('id');
		expect(user).toHaveProperty('username');
		expect(user).toHaveProperty('createdAt');
		expect(user).toHaveProperty('updatedAt');
	});
});

describe('getUserById', () => {
	it('returns user when found', async () => {
		const created = await createUser('testuser', null, logger);
		const found = await getUserById(created.id, logger);

		expect(found).toEqual(created);
	});

	it('returns user with correct username', async () => {
		const created = await createUser('specificuser', null, logger);
		const found = await getUserById(created.id, logger);

		expect(found?.username).toBe('specificuser');
	});

	it('throws when user not found', async () => {
		const nonexistentId = crypto.randomUUID();

		await expect(getUserById(nonexistentId, logger)).rejects.toThrow();
	});

	it('throws with descriptive error message when user not found', async () => {
		const nonexistentId = crypto.randomUUID();

		await expect(getUserById(nonexistentId, logger)).rejects.toThrow('Expected 1 User record(s), but found 0');
	});

	it('throws when id is not a valid uuid', async () => {
		await expect(getUserById('not-a-uuid', logger)).rejects.toThrow('The value "not-a-uuid" is not a valid ID for a User');
	});

	it('throws when id is an empty string', async () => {
		await expect(getUserById('', logger)).rejects.toThrow('The value "" is not a valid ID for a User');
	});

	it('returns correct user when multiple users exist', async () => {
		const _user1 = await createUser('alice', null, logger);
		const user2 = await createUser('bob', null, logger);
		const _user3 = await createUser('charlie', null, logger);

		const found = await getUserById(user2.id, logger);

		expect(found?.username).toBe('bob');
		expect(found?.id).toBe(user2.id);
	});

	it('returns user with valid UUID', async () => {
		const created = await createUser('testuser', null, logger);
		const found = await getUserById(created.id, logger);

		// UUID format validation
		const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
		expect(found?.id).toMatch(uuidRegex);
	});

	it('preserves all user fields', async () => {
		const created = await createUser('fulltest', null, logger);
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

describe('deleteUser', () => {
	it('sets deletedAt and deletedBy on the user record', async () => {
		const user = await createUser('tobedeleted', null, logger);

		const deleted = await deleteUser(user.id, null, logger);

		expect(deleted.deletedAt).not.toBeNull();
		expect(deleted.deletedBy).toBeNull();
	});

	it('records the actingUserId as deletedBy', async () => {
		const actor = await createUser('admin', null, logger);
		const target = await createUser('tobedeleted', null, logger);

		const deleted = await deleteUser(target.id, actor.id, logger);

		expect(deleted.deletedBy).toBe(actor.id);
	});

	it('does not affect other users', async () => {
		const user1 = await createUser('delete-me', null, logger);
		const user2 = await createUser('keep-me', null, logger);

		await deleteUser(user1.id, null, logger);

		const found = await getUserById(user2.id, logger);
		expect(found.username).toBe('keep-me');
		expect(found.deletedAt).toBeNull();
	});

	it('throws when user does not exist', async () => {
		await expect(deleteUser(crypto.randomUUID(), null, logger)).rejects.toThrow('Expected 1 User record(s), but found 0');
	});

	it('throws when id is not a valid uuid', async () => {
		await expect(deleteUser('not-a-uuid', null, logger)).rejects.toThrow('The value "not-a-uuid" is not a valid ID for a User');
	});
});

describe('updateUser', () => {
	it('updates the role and sets updatedAt', async () => {
		const actor = await createUser('actor', null, logger);
		const target = await createUser('target', null, logger);

		const updated = await updateUser(target.id, { role: 'ADMIN' }, actor.id, logger);

		expect(updated.role).toBe('ADMIN');
		expect(updated.updatedAt).not.toBeNull();
		expect(updated.updatedBy).toBe(actor.id);
	});

	it('does not affect other users', async () => {
		const actor = await createUser('actor', null, logger);
		const target = await createUser('target', null, logger);
		const bystander = await createUser('bystander', null, logger);

		await updateUser(target.id, { role: 'ADMIN' }, actor.id, logger);

		const found = await getUserById(bystander.id, logger);
		expect(found.role).not.toBe('ADMIN');
	});

	it('throws when user does not exist', async () => {
		await expect(updateUser(crypto.randomUUID(), { role: 'ADMIN' }, 'actor-id', logger)).rejects.toThrow(
			'Expected 1 User record(s), but found 0',
		);
	});

	it('throws when id is not a valid uuid', async () => {
		await expect(updateUser('not-a-uuid', { role: 'ADMIN' }, 'actor-id', logger)).rejects.toThrow(
			'The value "not-a-uuid" is not a valid ID for a User',
		);
	});

	it('throws when updating a deleted user', async () => {
		const actor = await createUser('actor', null, logger);
		const target = await createUser('target', null, logger);
		await deleteUser(target.id, actor.id, logger);

		await expect(updateUser(target.id, { role: 'ADMIN' }, actor.id, logger)).rejects.toThrow(
			'Expected 1 User record(s), but found 0',
		);
	});
});

describe('integration: createUser and getUserById', () => {
	it('can create and retrieve user in sequence', async () => {
		const created = await createUser('integration-test', null, logger);
		const retrieved = await getUserById(created.id, logger);

		expect(retrieved).toEqual(created);
	});

	it('can create multiple users and retrieve each one', async () => {
		const users = await Promise.all([
			createUser('user1', null, logger),
			createUser('user2', null, logger),
			createUser('user3', null, logger),
		]);

		for (const user of users) {
			const found = await getUserById(user.id, logger);
			expect(found).toEqual(user);
		}
	});

	it('maintains data integrity across operations', async () => {
		const user1 = await createUser('first', null, logger);
		const user2 = await createUser('second', null, logger);

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
