import { eq } from "drizzle-orm";

import { db } from "@/db";
import { users, type User, type UserInsert } from "@/models/schema";

export async function createUser(username: string): Promise<User> {
  const user: UserInsert = {
    id: crypto.randomUUID(),
    username,
    createdAt: new Date().toISOString(),
  };
  const [insertedUser] = await db.insert(users).values(user).returning();
  return insertedUser;
}

export async function getUserById(id: string): Promise<User | undefined> {

  const matchedUsers = await db.select().from(users).where(eq(users.id, id));
  if( matchedUsers.length !==1 ){
    throw new Error( `getUserById: matchedUsers length is ${ matchedUsers.length} for id ${ id }`);
  }
  return matchedUsers[0];
}

