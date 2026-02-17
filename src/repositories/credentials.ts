import { eq } from 'drizzle-orm';

import db from '@/db';
import { credentials } from '@/models';
import type { Credential, CredentialInsert, TestableDB } from '@/types';

export async function createCredential(newCredential: CredentialInsert, database: TestableDB = db): Promise<Credential> {
	console.log('Creating credential for user: %s', newCredential.userId);

	const [insertedCredential] = await database.insert(credentials).values(newCredential).returning();
	console.log('Credential created successfully: %s', insertedCredential.id);
	return insertedCredential;
}

export async function getCredentialsByUserId(userId: string, database: TestableDB = db): Promise<Credential[]> {
	const matchedCredentials = await database.select().from(credentials).where(eq(credentials.userId, userId));
	return matchedCredentials;
}

export async function getCredentialById(credentialId: string, database: TestableDB = db): Promise<Credential | undefined> {
	const matchedCredentials = await database.select().from(credentials).where(eq(credentials.credentialId, credentialId));

	if (matchedCredentials.length > 1) {
		throw new Error(`getCredentialById: matchedCredentials length is ${matchedCredentials.length} for id ${credentialId}`);
	}

	if (matchedCredentials.length === 0) {
		return undefined;
	}

	return matchedCredentials[0];
}

export async function updateCredentialCounter(credentialId: string, counter: number, database: TestableDB = db): Promise<void> {
	await database.update(credentials).set({ counter }).where(eq(credentials.id, credentialId));

	console.log('Updated credential counter for %s to %d', credentialId, counter);
}
