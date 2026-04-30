import { eq } from 'drizzle-orm';

import db from '@/db';
import type RzLogger from '@/logger';
import { credentials } from '@/models';
import type { Credential, CredentialInsert } from '@/types';

export async function createCredential(newCredential: CredentialInsert, logger: RzLogger): Promise<Credential> {
	logger.debug(`Creating credential for user ${newCredential.userId}`);

	const [insertedCredential] = await db.insert(credentials).values(newCredential).returning();
	logger.info(`Created credential ${insertedCredential.id}`);
	return insertedCredential;
}

export async function getCredentialsByUserId(userId: string, logger: RzLogger): Promise<Credential[]> {
	logger.debug(`Fetching credentials for user ${userId}`);
	const matchedCredentials = await db.select().from(credentials).where(eq(credentials.userId, userId));
	logger.debug(`Fetched ${matchedCredentials.length} credentials for user ${userId}`);
	return matchedCredentials;
}

export async function getCredentialById(credentialId: string, logger: RzLogger): Promise<Credential> {
	logger.debug(`Fetching credential ${credentialId}`);
	const matchedCredentials = await db.select().from(credentials).where(eq(credentials.credentialId, credentialId));

	if (matchedCredentials.length !== 1) {
		throw new Error(`getCredentialById: matchedCredentials length is ${matchedCredentials.length} for id ${credentialId}`);
	}

	return matchedCredentials[0];
}

export async function updateCredentialCounter(credentialId: string, counter: number, logger: RzLogger): Promise<void> {
	logger.debug(`Updating credential counter for ${credentialId}`);
	await db.update(credentials).set({ counter }).where(eq(credentials.id, credentialId));

	logger.info(`Updated credential counter for ${credentialId} to ${counter}`);
}
