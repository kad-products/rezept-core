import { and, eq, isNull, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import { users } from '@/models';
import type { RzLogger, UserDBRead, UserWriteInput } from '@/types';
import { validateUuid } from './utils';

export async function getUsers(logger: RzLogger, includeDeleted = false): Promise<UserDBRead[]> {
	logger.debug('Fetching all users');
	return db
		.select()
		.from(users)
		.where(includeDeleted ? undefined : isNull(users.deletedAt));
}

export async function updateUser(
	id: string,
	data: Partial<UserWriteInput>,
	actingUserId: string,
	logger: RzLogger,
): Promise<UserDBRead> {
	if (!validateUuid(id)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [id, 'User']);
	}

	logger.debug(`Updating user ${id}`);
	const updated = await db
		.update(users)
		.set({ ...data, updatedAt: sql`(datetime('now', 'localtime'))`, updatedBy: actingUserId })
		.where(and(eq(users.id, id), isNull(users.deletedAt)))
		.returning();

	if (updated.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [updated.length, 1, 'User']);
	}

	logger.info(`Updated user ${id}`);
	return updated[0];
}

export async function createUser(username: string, actingUserId: string | null, logger: RzLogger): Promise<UserDBRead> {
	logger.debug(`Creating user ${username}`);
	const user: UserWriteInput = {
		username,
	};
	const [insertedUser] = await db
		.insert(users)
		.values({ ...user, createdBy: actingUserId })
		.returning();
	logger.info(`Created user ${insertedUser.id}`);
	return insertedUser;
}

export async function deleteUser(id: string, actingUserId: string | null, logger: RzLogger): Promise<UserDBRead> {
	if (!validateUuid(id)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [id, 'User']);
	}

	logger.debug(`Deleting user ${id}`);
	const deleted = await db
		.update(users)
		.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: actingUserId })
		.where(eq(users.id, id))
		.returning();

	if (deleted.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [deleted.length, 1, 'User']);
	}

	logger.info(`Deleted user ${id}`);
	return deleted[0];
}

export async function getUserById(id: string, logger: RzLogger): Promise<UserDBRead> {
	if (!validateUuid(id)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [id, 'User']);
	}

	logger.debug(`Fetching user ${id}`);
	const matchedUsers = await db
		.select()
		.from(users)
		.where(and(eq(users.id, id), isNull(users.deletedAt)));

	if (matchedUsers.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [matchedUsers.length, 1, 'User']);
	}

	return matchedUsers[0];
}
