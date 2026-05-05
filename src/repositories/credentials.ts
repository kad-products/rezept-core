import { eq, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import type RzLogger from '@/logger';
import { credentials } from '@/models';
import type { CredentialDBRead, CredentialWriteInput } from '@/types';
import { validateUuid } from './utils';

export async function createCredential(
	newCredential: CredentialWriteInput,
	actingUserId: string | null,
	logger: RzLogger,
): Promise<CredentialDBRead> {
	logger.debug(`Creating credential for user ${newCredential.userId}`);

	const [insertedCredential] = await db
		.insert(credentials)
		.values({ ...newCredential, createdBy: actingUserId })
		.returning();
	logger.info(`Created credential ${insertedCredential.id}`);
	return insertedCredential;
}

export async function getCredentialsByUserId(userId: string, logger: RzLogger): Promise<CredentialDBRead[]> {
	logger.debug(`Fetching credentials for user ${userId}`);
	const matchedCredentials = await db.select().from(credentials).where(eq(credentials.userId, userId));
	logger.debug(`Fetched ${matchedCredentials.length} credentials for user ${userId}`);
	return matchedCredentials;
}

export async function getCredentialById(credentialId: string, logger: RzLogger): Promise<CredentialDBRead> {
	// credentialId is a WebAuthn credential identifier, not an internal UUID — no UUID validation
	logger.debug(`Fetching credential ${credentialId}`);
	const matchedCredentials = await db.select().from(credentials).where(eq(credentials.credentialId, credentialId));

	if (matchedCredentials.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [matchedCredentials.length, 1, 'Credential']);
	}

	return matchedCredentials[0];
}

export async function updateCredentialCounter(
	credentialId: string,
	counter: number,
	actingUserId: string,
	logger: RzLogger,
): Promise<void> {
	if (!validateUuid(credentialId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [credentialId, 'Credential']);
	}

	logger.debug(`Updating credential counter for ${credentialId}`);
	const updated = await db
		.update(credentials)
		.set({ counter, updatedAt: sql`(datetime('now', 'localtime'))`, updatedBy: actingUserId })
		.where(eq(credentials.id, credentialId))
		.returning();

	if (updated.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [updated.length, 1, 'Credential']);
	}

	logger.info(`Updated credential counter for ${credentialId} to ${counter}`);
}
