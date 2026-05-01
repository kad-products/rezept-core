import { eq } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import type RzLogger from '@/logger';
import { users } from '@/models';
import type { User, UserInsert } from '@/types';
import { validateUuid } from './utils';

export async function createUser(username: string, logger: RzLogger): Promise<User> {
	logger.debug(`Creating user ${username}`);
	const user: UserInsert = {
		id: crypto.randomUUID(),
		username,
		createdAt: new Date().toISOString(),
	};
	const [insertedUser] = await db.insert(users).values(user).returning();
	logger.info(`Created user ${insertedUser.id}`);
	return insertedUser;
}

export async function getUserById(id: string, logger: RzLogger): Promise<User> {
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
