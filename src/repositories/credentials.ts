import { eq } from "drizzle-orm";

import { db } from "@/db/db";
import { type Credential, credentials, CredentialInsert } from "@/db/schema";

export async function createCredential(
  newCredential: CredentialInsert,
): Promise<Credential> {
  console.log("Creating credential for user: %s", newCredential.userId);

  const [insertedCredential] = await db.insert(credentials).values(newCredential).returning();
  console.log("Credential created successfully: %s", insertedCredential.id);
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

  console.log("Updated credential counter for %s to %d", credentialId, counter);

}