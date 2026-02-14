import { eq } from 'drizzle-orm';
import db from '@/db';
import { lists } from '@/models/schema';
import type { List } from '@/types';

export async function getLists(): Promise<List[]> {
	const allLists = await db.select().from(lists);
	return allLists;
}

export async function getListById(listId: string): Promise<List | undefined> {
	const matchedLists = await db.select().from(lists).where(eq(lists.id, listId));

	if (matchedLists.length > 1) {
		throw new Error(`getListById: matchedLists length is ${matchedLists.length} for id ${listId}`);
	}

	if (matchedLists.length === 0) {
		return undefined;
	}

	return matchedLists[0];
}
