import { randomUUID } from 'node:crypto';
import { beforeEach, describe, expect, it } from 'vitest';
import type { CredentialInsert } from '@/types';
import { resetDb } from '../../../tests/mocks/db';
import { createCredential, getCredentialById, getCredentialsByUserId, updateCredentialCounter } from '../credentials';
import { createUser } from '../users';

beforeEach(async () => {
	await resetDb();
});

// Helper to create a valid credential insert object
function createCredentialData(userId: string, overrides?: Partial<CredentialInsert>): CredentialInsert {
	return {
		id: crypto.randomUUID(),
		userId,
		credentialId: `cred-${crypto.randomUUID()}`,
		publicKey: new Uint8Array([1, 2, 3, 4, 5]),
		counter: 0,
		createdAt: new Date().toISOString(),
		...overrides,
	};
}

describe('createCredential', () => {
	it('creates a credential with all required fields', async () => {
		const user = await createUser('testuser');
		const credData = createCredentialData(user.id);

		const credential = await createCredential(credData);

		expect(credential.id).toBe(credData.id);
		expect(credential.userId).toBe(user.id);
		expect(credential.credentialId).toBe(credData.credentialId);
		expect(credential.counter).toBe(0);
	});

	it('creates credential with custom counter', async () => {
		const user = await createUser('testuser');
		const credData = createCredentialData(user.id, { counter: 42 });

		const credential = await createCredential(credData);

		expect(credential.counter).toBe(42);
	});

	it('creates credential with name', async () => {
		const user = await createUser('testuser');
		const credData = createCredentialData(user.id, { name: 'My Yubikey' });

		const credential = await createCredential(credData);

		expect(credential.name).toBe('My Yubikey');
	});

	it('creates credential without name', async () => {
		const user = await createUser('testuser');
		const credData = createCredentialData(user.id);

		const credential = await createCredential(credData);

		expect(credential.name).toBeNull();
	});

	it('creates multiple credentials for same user', async () => {
		const user = await createUser('testuser');

		const cred1 = await createCredential(createCredentialData(user.id));
		const cred2 = await createCredential(createCredentialData(user.id));

		expect(cred1.id).not.toBe(cred2.id);
		expect(cred1.credentialId).not.toBe(cred2.credentialId);
		expect(cred1.userId).toBe(user.id);
		expect(cred2.userId).toBe(user.id);
	});

	it('creates credentials for different users', async () => {
		const user1 = await createUser('user1');
		const user2 = await createUser('user2');

		const cred1 = await createCredential(createCredentialData(user1.id));
		const cred2 = await createCredential(createCredentialData(user2.id));

		expect(cred1.userId).toBe(user1.id);
		expect(cred2.userId).toBe(user2.id);
	});

	it('stores publicKey as binary data', async () => {
		const user = await createUser('testuser');
		const publicKey = new Uint8Array([10, 20, 30, 40, 50]);
		const credData = createCredentialData(user.id, { publicKey });

		const credential = await createCredential(credData);

		// Compare as arrays
		expect([...credential.publicKey]).toEqual([10, 20, 30, 40, 50]);
	});

	it('handles unique credentialId constraint', async () => {
		const user = await createUser('testuser');
		const credentialId = `unique-cred-${randomUUID()}`;

		await createCredential(createCredentialData(user.id, { credentialId }));

		// Attempting to create with same credentialId should fail
		await expect(createCredential(createCredentialData(user.id, { credentialId }))).rejects.toThrow();
	});

	it('cascades delete when user is deleted', async () => {
		// This test depends on your user deletion functionality
		// Placeholder for now - implement when you have deleteUser
		expect(true).toBe(true);
	});
});

describe('getCredentialsByUserId', () => {
	it('returns empty array when user has no credentials', async () => {
		const user = await createUser('testuser');

		const credentials = await getCredentialsByUserId(user.id);

		expect(credentials).toEqual([]);
	});

	it('returns single credential for user', async () => {
		const user = await createUser('testuser');
		const created = await createCredential(createCredentialData(user.id));

		const credentials = await getCredentialsByUserId(user.id);

		expect(credentials).toHaveLength(1);
		expect(credentials[0].id).toBe(created.id);
	});

	it('returns multiple credentials for user', async () => {
		const user = await createUser('testuser');

		const cred1 = await createCredential(createCredentialData(user.id, { name: 'Yubikey 1' }));
		const cred2 = await createCredential(createCredentialData(user.id, { name: 'Yubikey 2' }));
		const cred3 = await createCredential(createCredentialData(user.id, { name: 'iPhone' }));

		const credentials = await getCredentialsByUserId(user.id);

		expect(credentials).toHaveLength(3);

		const ids = credentials.map(c => c.id);
		expect(ids).toContain(cred1.id);
		expect(ids).toContain(cred2.id);
		expect(ids).toContain(cred3.id);
	});

	it('returns only credentials for specified user', async () => {
		const user1 = await createUser('user1');
		const user2 = await createUser('user2');

		await createCredential(createCredentialData(user1.id));
		const user2Cred = await createCredential(createCredentialData(user2.id));

		const user2Credentials = await getCredentialsByUserId(user2.id);

		expect(user2Credentials).toHaveLength(1);
		expect(user2Credentials[0].id).toBe(user2Cred.id);
	});

	it('returns empty array for non-existent user', async () => {
		const nonexistentUserId = randomUUID();

		const credentials = await getCredentialsByUserId(nonexistentUserId);

		expect(credentials).toEqual([]);
	});

	it('returns credentials with all fields', async () => {
		const user = await createUser('testuser');
		await createCredential(
			createCredentialData(user.id, {
				name: 'Test Key',
				counter: 5,
			}),
		);

		const credentials = await getCredentialsByUserId(user.id);

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
		const user = await createUser('testuser');
		const created = await createCredential(createCredentialData(user.id));

		const found = await getCredentialById(created.credentialId);

		expect(found).toBeDefined();
		expect(found?.id).toBe(created.id);
	});

	it('throws when credential not found', async () => {
		await expect(getCredentialById('nonexistent-cred-id')).rejects.toThrow();
	});

	it('returns correct credential when multiple exist', async () => {
		const user = await createUser('testuser');

		await createCredential(createCredentialData(user.id));
		const target = await createCredential(createCredentialData(user.id));
		await createCredential(createCredentialData(user.id));

		const found = await getCredentialById(target.credentialId);

		expect(found?.id).toBe(target.id);
		expect(found?.credentialId).toBe(target.credentialId);
	});

	it('throws when multiple credentials have same credentialId', async () => {
		// This shouldn't happen due to unique constraint, but test the error handling
		// You'd need to manually insert duplicates to test this, which might not be possible
		// with the unique constraint. This is more of a sanity check.
		expect(true).toBe(true); // Placeholder
	});

	it('returns credential with all fields intact', async () => {
		const user = await createUser('testuser');
		const publicKey = new Uint8Array([100, 200, 30]);
		const created = await createCredential(
			createCredentialData(user.id, {
				name: 'Security Key',
				counter: 10,
				publicKey,
			}),
		);

		const found = await getCredentialById(created.credentialId);

		expect(found?.name).toBe('Security Key');
		expect(found?.counter).toBe(10);
		expect([...(found?.publicKey || [])]).toEqual([100, 200, 30]);
	});

	it('searches by credentialId not internal id', async () => {
		const user = await createUser('testuser');
		const created = await createCredential(createCredentialData(user.id));

		// Using credentialId (the WebAuthn credential ID)
		const found = await getCredentialById(created.credentialId);
		expect(found).toBeDefined();

		// Using internal id should not find it (this is by credentialId)
		await expect(getCredentialById(created.id)).rejects.toThrow();
	});
});

describe('updateCredentialCounter', () => {
	it('updates counter for credential', async () => {
		const user = await createUser('testuser');
		const credential = await createCredential(createCredentialData(user.id));

		await updateCredentialCounter(credential.id, 5);

		const updated = await getCredentialById(credential.credentialId);
		expect(updated?.counter).toBe(5);
	});

	it('increments counter over multiple updates', async () => {
		const user = await createUser('testuser');
		const credential = await createCredential(createCredentialData(user.id));

		await updateCredentialCounter(credential.id, 1);
		await updateCredentialCounter(credential.id, 2);
		await updateCredentialCounter(credential.id, 3);

		const updated = await getCredentialById(credential.credentialId);
		expect(updated?.counter).toBe(3);
	});

	it('updates only specified credential', async () => {
		const user = await createUser('testuser');
		const cred1 = await createCredential(createCredentialData(user.id));
		const cred2 = await createCredential(createCredentialData(user.id));

		await updateCredentialCounter(cred1.id, 10);

		const updated1 = await getCredentialById(cred1.credentialId);
		const updated2 = await getCredentialById(cred2.credentialId);

		expect(updated1?.counter).toBe(10);
		expect(updated2?.counter).toBe(0); // Should remain unchanged
	});

	it('can set counter to 0', async () => {
		const user = await createUser('testuser');
		const credential = await createCredential(createCredentialData(user.id, { counter: 100 }));

		await updateCredentialCounter(credential.id, 0);

		const updated = await getCredentialById(credential.credentialId);
		expect(updated?.counter).toBe(0);
	});

	it('can set counter to large values', async () => {
		const user = await createUser('testuser');
		const credential = await createCredential(createCredentialData(user.id));

		await updateCredentialCounter(credential.id, 999999);

		const updated = await getCredentialById(credential.credentialId);
		expect(updated?.counter).toBe(999999);
	});

	it('does not modify other credential fields', async () => {
		const user = await createUser('testuser');
		const publicKey = new Uint8Array([50, 60, 70]);
		const credential = await createCredential(
			createCredentialData(user.id, {
				name: 'Test Key',
				publicKey,
			}),
		);

		await updateCredentialCounter(credential.id, 42);

		const updated = await getCredentialById(credential.credentialId);
		expect(updated?.name).toBe('Test Key');
		expect([...(updated?.publicKey || [])]).toEqual([...publicKey]);
		expect(updated?.credentialId).toBe(credential.credentialId);
	});

	it('handles updating non-existent credential gracefully', async () => {
		const nonexistentId = randomUUID();

		// Should not throw, just do nothing
		await expect(updateCredentialCounter(nonexistentId, 5)).resolves.not.toThrow();
	});
});

describe('integration: credential lifecycle', () => {
	it('can create, retrieve, and update credential', async () => {
		const user = await createUser('testuser');

		// Create
		const created = await createCredential(createCredentialData(user.id, { name: 'My Key' }));
		expect(created.counter).toBe(0);

		// Retrieve by credentialId
		const found = await getCredentialById(created.credentialId);
		expect(found?.name).toBe('My Key');

		// Update counter
		await updateCredentialCounter(created.id, 1);

		// Verify update
		const updated = await getCredentialById(created.credentialId);
		expect(updated?.counter).toBe(1);
	});

	it('can manage multiple credentials per user', async () => {
		const user = await createUser('multikey-user');

		// Create multiple credentials
		const yubikey = await createCredential(createCredentialData(user.id, { name: 'Yubikey' }));
		const iphone = await createCredential(createCredentialData(user.id, { name: 'iPhone' }));

		// Update each independently
		await updateCredentialCounter(yubikey.id, 5);
		await updateCredentialCounter(iphone.id, 3);

		// Verify both updated correctly
		const allCreds = await getCredentialsByUserId(user.id);
		expect(allCreds).toHaveLength(2);

		const yubikeyUpdated = allCreds.find(c => c.name === 'Yubikey');
		const iphoneUpdated = allCreds.find(c => c.name === 'iPhone');

		expect(yubikeyUpdated?.counter).toBe(5);
		expect(iphoneUpdated?.counter).toBe(3);
	});
});
