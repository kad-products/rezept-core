import { eq } from 'drizzle-orm';

import db from '@/db';
import type RzLogger from '@/logger';
import { users } from '@/models';
import type { User, UserInsert } from '@/types';

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

export async function getUserById(id: string, logger: RzLogger): Promise<User | undefined> {
	logger.debug(`Fetching user ${id}`);
	const matchedUsers = await db.select().from(users).where(eq(users.id, id));
	if (matchedUsers.length !== 1) {
		throw new Error(`getUserById: matchedUsers length is ${matchedUsers.length} for id ${id}`);
	}
	return matchedUsers[0];
}
