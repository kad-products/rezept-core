import { eq } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import type RzLogger from '@/logger';
import { users } from '@/models';
import type { UserDBRead, UserWriteInput } from '@/types';
import { validateUuid } from './utils';

export async function createUser(username: string, logger: RzLogger): Promise<UserDBRead> {
	logger.debug(`Creating user ${username}`);
	const user: UserWriteInput = {
		id: crypto.randomUUID(),
		username,
	};
	const [insertedUser] = await db.insert(users).values(user).returning();
	logger.info(`Created user ${insertedUser.id}`);
	return insertedUser;
}

export async function deleteUser(id: string, logger: RzLogger): Promise<void> {
	if (!validateUuid(id)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [id, 'User']);
	}

	logger.debug(`Deleting user ${id}`);
	const deleted = await db.delete(users).where(eq(users.id, id)).returning();

	if (deleted.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [deleted.length, 1, 'User']);
	}

	logger.info(`Deleted user ${id}`);
}

export async function getUserById(id: string, logger: RzLogger): Promise<UserDBRead> {
	if (!validateUuid(id)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [id, 'User']);
	}

	logger.debug(`Fetching user ${id}`);
	const matchedUsers = await db.select().from(users).where(eq(users.id, id));

	if (matchedUsers.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [matchedUsers.length, 1, 'User']);
	}

	return matchedUsers[0];
}
