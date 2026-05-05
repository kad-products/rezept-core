import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import type { CredentialWriteInput } from '@/types';
import { resetDb } from '../../../tests/mocks/db';
import { createCredential, getCredentialById, getCredentialsByUserId, updateCredentialCounter } from '../credentials';
import { createUser, deleteUser } from '../users';

const logger = new Logger();

beforeEach(async () => {
	await resetDb();
});

// Helper to create a valid credential insert object
function createCredentialData(userId: string, overrides?: Partial<CredentialWriteInput>): CredentialWriteInput {
	return {
		id: crypto.randomUUID(),
		userId,
		credentialId: `cred-${crypto.randomUUID()}`,
		publicKey: new Uint8Array([1, 2, 3, 4, 5]),
		counter: 0,
		...overrides,
	};
}

describe('createCredential', () => {
	it('creates a credential with all required fields', async () => {
		const user = await createUser('testuser', null, logger);
		const credData = createCredentialData(user.id);

		const credential = await createCredential(credData, logger);

		expect(credential.id).toBe(credData.id);
		expect(credential.userId).toBe(user.id);
		expect(credential.credentialId).toBe(credData.credentialId);
		expect(credential.counter).toBe(0);
	});

	it('creates credential with custom counter', async () => {
		const user = await createUser('testuser', null, logger);
		const credData = createCredentialData(user.id, { counter: 42 });

		const credential = await createCredential(credData, logger);

		expect(credential.counter).toBe(42);
	});

	it('creates credential with name', async () => {
		const user = await createUser('testuser', null, logger);
		const credData = createCredentialData(user.id, { name: 'My Yubikey' });

		const credential = await createCredential(credData, logger);

		expect(credential.name).toBe('My Yubikey');
	});

	it('creates credential without name', async () => {
		const user = await createUser('testuser', null, logger);
		const credData = createCredentialData(user.id);

		const credential = await createCredential(credData, logger);

		expect(credential.name).toBeNull();
	});

	it('creates multiple credentials for same user', async () => {
		const user = await createUser('testuser', null, logger);

		const cred1 = await createCredential(createCredentialData(user.id), logger);
		const cred2 = await createCredential(createCredentialData(user.id), logger);

		expect(cred1.id).not.toBe(cred2.id);
		expect(cred1.credentialId).not.toBe(cred2.credentialId);
		expect(cred1.userId).toBe(user.id);
		expect(cred2.userId).toBe(user.id);
	});

	it('creates credentials for different users', async () => {
		const user1 = await createUser('user1', null, logger);
		const user2 = await createUser('user2', null, logger);

		const cred1 = await createCredential(createCredentialData(user1.id), logger);
		const cred2 = await createCredential(createCredentialData(user2.id), logger);

		expect(cred1.userId).toBe(user1.id);
		expect(cred2.userId).toBe(user2.id);
	});

	it('stores publicKey as binary data', async () => {
		const user = await createUser('testuser', null, logger);
		const publicKey = new Uint8Array([10, 20, 30, 40, 50]);
		const credData = createCredentialData(user.id, { publicKey });

		const credential = await createCredential(credData, logger);

		// Compare as arrays
		expect([...credential.publicKey]).toEqual([10, 20, 30, 40, 50]);
	});

	it('handles unique credentialId constraint', async () => {
		const user = await createUser('testuser', null, logger);
		const credentialId = `unique-cred-${randomUUID()}`;

		await createCredential(createCredentialData(user.id, { credentialId }), logger);

		// Attempting to create with same credentialId should fail
		await expect(createCredential(createCredentialData(user.id, { credentialId }), logger)).rejects.toThrow();
	});

	it('cascades delete when user is deleted', async () => {
		const user = await createUser('tobedeleted', null, logger);
		await createCredential(createCredentialData(user.id, { name: 'My Key' }), logger);
		await createCredential(createCredentialData(user.id, { name: 'My Other Key' }), logger);

		await deleteUser(user.id, logger);

		const remaining = await getCredentialsByUserId(user.id, logger);
		expect(remaining).toHaveLength(0);
	});
});

describe('getCredentialsByUserId', () => {
	it('returns empty array when user has no credentials', async () => {
		const user = await createUser('testuser', null, logger);

		const credentials = await getCredentialsByUserId(user.id, logger);

		expect(credentials).toEqual([]);
	});

	it('returns single credential for user', async () => {
		const user = await createUser('testuser', null, logger);
		const created = await createCredential(createCredentialData(user.id), logger);

		const credentials = await getCredentialsByUserId(user.id, logger);

		expect(credentials).toHaveLength(1);
		expect(credentials[0].id).toBe(created.id);
	});

	it('returns multiple credentials for user', async () => {
		const user = await createUser('testuser', null, logger);

		const cred1 = await createCredential(createCredentialData(user.id, { name: 'Yubikey 1' }), logger);
		const cred2 = await createCredential(createCredentialData(user.id, { name: 'Yubikey 2' }), logger);
		const cred3 = await createCredential(createCredentialData(user.id, { name: 'iPhone' }), logger);

		const credentials = await getCredentialsByUserId(user.id, logger);

		expect(credentials).toHaveLength(3);

		const ids = credentials.map(c => c.id);
		expect(ids).toContain(cred1.id);
		expect(ids).toContain(cred2.id);
		expect(ids).toContain(cred3.id);
	});

	it('returns only credentials for specified user', async () => {
		const user1 = await createUser('user1', null, logger);
		const user2 = await createUser('user2', null, logger);

		await createCredential(createCredentialData(user1.id), logger);
		const user2Cred = await createCredential(createCredentialData(user2.id), logger);

		const user2Credentials = await getCredentialsByUserId(user2.id, logger);

		expect(user2Credentials).toHaveLength(1);
		expect(user2Credentials[0].id).toBe(user2Cred.id);
	});

	it('returns empty array for non-existent user', async () => {
		const nonexistentUserId = randomUUID();

		const credentials = await getCredentialsByUserId(nonexistentUserId, logger);

		expect(credentials).toEqual([]);
	});

	it('returns credentials with all fields', async () => {
		const user = await createUser('testuser', null, logger);
		await createCredential(
			createCredentialData(user.id, {
				name: 'Test Key',
				counter: 5,
			}),
			logger,
		);

		const credentials = await getCredentialsByUserId(user.id, logger);

		expect(credentials[0]).toHaveProperty('id');
		expect(credentials[0]).toHaveProperty('userId');
		expect(credentials[0]).toHaveProperty('credentialId');
		expect(credentials[0]).toHaveProperty('publicKey');
		expect(credentials[0]).toHaveProperty('counter');
		expect(credentials[0]).toHaveProperty('name');
		expect(credentials[0]).toHaveProperty('createdAt');
	});
});

describe('getCredentialById', () => {
	it('returns credential when found', async () => {
		const user = await createUser('testuser', null, logger);
		const created = await createCredential(createCredentialData(user.id), logger);

		const found = await getCredentialById(created.credentialId, logger);

		expect(found).toBeDefined();
		expect(found?.id).toBe(created.id);
	});

	it('throws when credential not found', async () => {
		await expect(getCredentialById('nonexistent-cred-id', logger)).rejects.toThrow();
	});

	it('returns correct credential when multiple exist', async () => {
		const user = await createUser('testuser', null, logger);

		await createCredential(createCredentialData(user.id), logger);
		const target = await createCredential(createCredentialData(user.id), logger);
		await createCredential(createCredentialData(user.id), logger);

		const found = await getCredentialById(target.credentialId, logger);

		expect(found?.id).toBe(target.id);
		expect(found?.credentialId).toBe(target.credentialId);
	});

	it('returns credential with all fields intact', async () => {
		const user = await createUser('testuser', null, logger);
		const publicKey = new Uint8Array([100, 200, 30]);
		const created = await createCredential(
			createCredentialData(user.id, {
				name: 'Security Key',
				counter: 10,
				publicKey,
			}),
			logger,
		);

		const found = await getCredentialById(created.credentialId, logger);

		expect(found?.name).toBe('Security Key');
		expect(found?.counter).toBe(10);
		expect([...(found?.publicKey || [])]).toEqual([100, 200, 30]);
	});

	it('searches by credentialId not internal id', async () => {
		const user = await createUser('testuser', null, logger);
		const created = await createCredential(createCredentialData(user.id), logger);

		// Using credentialId (the WebAuthn credential ID)
		const found = await getCredentialById(created.credentialId, logger);
		expect(found).toBeDefined();

		// Using internal id should not find it (this is by credentialId)
		await expect(getCredentialById(created.id, logger)).rejects.toThrow();
	});
});

describe('updateCredentialCounter', () => {
	it('updates counter for credential', async () => {
		const user = await createUser('testuser', null, logger);
		const credential = await createCredential(createCredentialData(user.id), logger);

		await updateCredentialCounter(credential.id, 5, logger);

		const updated = await getCredentialById(credential.credentialId, logger);
		expect(updated?.counter).toBe(5);
	});

	it('increments counter over multiple updates', async () => {
		const user = await createUser('testuser', null, logger);
		const credential = await createCredential(createCredentialData(user.id), logger);

		await updateCredentialCounter(credential.id, 1, logger);
		await updateCredentialCounter(credential.id, 2, logger);
		await updateCredentialCounter(credential.id, 3, logger);

		const updated = await getCredentialById(credential.credentialId, logger);
		expect(updated?.counter).toBe(3);
	});

	it('updates only specified credential', async () => {
		const user = await createUser('testuser', null, logger);
		const cred1 = await createCredential(createCredentialData(user.id), logger);
		const cred2 = await createCredential(createCredentialData(user.id), logger);

		await updateCredentialCounter(cred1.id, 10, logger);

		const updated1 = await getCredentialById(cred1.credentialId, logger);
		const updated2 = await getCredentialById(cred2.credentialId, logger);

		expect(updated1?.counter).toBe(10);
		expect(updated2?.counter).toBe(0); // Should remain unchanged
	});

	it('can set counter to 0', async () => {
		const user = await createUser('testuser', null, logger);
		const credential = await createCredential(createCredentialData(user.id, { counter: 100 }), logger);

		await updateCredentialCounter(credential.id, 0, logger);

		const updated = await getCredentialById(credential.credentialId, logger);
		expect(updated?.counter).toBe(0);
	});

	it('can set counter to large values', async () => {
		const user = await createUser('testuser', null, logger);
		const credential = await createCredential(createCredentialData(user.id), logger);

		await updateCredentialCounter(credential.id, 999999, logger);

		const updated = await getCredentialById(credential.credentialId, logger);
		expect(updated?.counter).toBe(999999);
	});

	it('does not modify other credential fields', async () => {
		const user = await createUser('testuser', null, logger);
		const publicKey = new Uint8Array([50, 60, 70]);
		const credential = await createCredential(
			createCredentialData(user.id, {
				name: 'Test Key',
				publicKey,
			}),
			logger,
		);

		await updateCredentialCounter(credential.id, 42, logger);

		const updated = await getCredentialById(credential.credentialId, logger);
		expect(updated?.name).toBe('Test Key');
		expect([...(updated?.publicKey || [])]).toEqual([...publicKey]);
		expect(updated?.credentialId).toBe(credential.credentialId);
	});

	it('throws when updating non-existent credential', async () => {
		const nonexistentId = randomUUID();

		await expect(updateCredentialCounter(nonexistentId, 5, logger)).rejects.toThrow(
			'Expected 1 Credential record(s), but found 0',
		);
	});

	it('throws when id is not a valid uuid', async () => {
		await expect(updateCredentialCounter('not-a-uuid', 5, logger)).rejects.toThrow(
			'The value "not-a-uuid" is not a valid ID for a Credential',
		);
	});
});

describe('integration: credential lifecycle', () => {
	it('can create, retrieve, and update credential', async () => {
		const user = await createUser('testuser', null, logger);

		// Create
		const created = await createCredential(createCredentialData(user.id, { name: 'My Key' }), logger);
		expect(created.counter).toBe(0);

		// Retrieve by credentialId
		const found = await getCredentialById(created.credentialId, logger);
		expect(found?.name).toBe('My Key');

		// Update counter
		await updateCredentialCounter(created.id, 1, logger);

		// Verify update
		const updated = await getCredentialById(created.credentialId, logger);
		expect(updated?.counter).toBe(1);
	});

	it('can manage multiple credentials per user', async () => {
		const user = await createUser('multikey-user', null, logger);

		// Create multiple credentials
		const yubikey = await createCredential(createCredentialData(user.id, { name: 'Yubikey' }), logger);
		const iphone = await createCredential(createCredentialData(user.id, { name: 'iPhone' }), logger);

		// Update each independently
		await updateCredentialCounter(yubikey.id, 5, logger);
		await updateCredentialCounter(iphone.id, 3, logger);

		// Verify both updated correctly
		const allCreds = await getCredentialsByUserId(user.id, logger);
		expect(allCreds).toHaveLength(2);

		const yubikeyUpdated = allCreds.find(c => c.name === 'Yubikey');
		const iphoneUpdated = allCreds.find(c => c.name === 'iPhone');

		expect(yubikeyUpdated?.counter).toBe(5);
		expect(iphoneUpdated?.counter).toBe(3);
	});
});
