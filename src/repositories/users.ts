import { eq } from 'drizzle-orm';

import db from '@/db';
import { users } from '@/models';
import type { TestableDB, User, UserInsert } from '@/types';

export async function createUser(username: string, database: TestableDB = db): Promise<User> {
	const user: UserInsert = {
		id: crypto.randomUUID(),
		username,
		createdAt: new Date().toISOString(),
	};
	const [insertedUser] = await database.insert(users).values(user).returning();
	return insertedUser;
}

export async function getUserById(id: string, database: TestableDB = db): Promise<User | undefined> {
	const matchedUsers = await database.select().from(users).where(eq(users.id, id));
	if (matchedUsers.length !== 1) {
		throw new Error(`getUserById: matchedUsers length is ${matchedUsers.length} for id ${id}`);
	}
	return matchedUsers[0];
}
