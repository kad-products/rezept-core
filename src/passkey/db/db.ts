import debug from "rwsdk/debug";
import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { users, type User, type UserInsert, type Credential, credentials, CredentialInsert } from "@/db/schema";

const log = debug("passkey:db");

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

export async function createCredential(
  newCredential: CredentialInsert,
): Promise<Credential> {
  log("Creating credential for user: %s", newCredential.userId);

  const [insertedCredential] = await db.insert(credentials).values(newCredential).returning();
  log("Credential created successfully: %s", insertedCredential.id);
  return insertedCredential;
}

export async function getCredentialById(
  credentialId: string,
): Promise<Credential | undefined> {
  const matchedCredentials = await db.select().from(credentials).where(eq(credentials.credentialId, credentialId));

  if( matchedCredentials.length > 1 ){
    throw new Error( `getCredentialById: matchedCredentials length is ${ matchedCredentials.length} for id ${ credentialId }`);
  }

  if( matchedCredentials.length === 0 ){
    return undefined;
  }

  return matchedCredentials[0];
}

export async function updateCredentialCounter(
  credentialId: string,
  counter: number,
): Promise<void> {

  await db.update(credentials)
    .set({ counter })
    .where(eq(credentials.id, credentialId));

  log("Updated credential counter for %s to %d", credentialId, counter);

}