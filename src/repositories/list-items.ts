import { eq } from 'drizzle-orm';
import db from '@/db';
import { listItems } from '@/models';
import type { ListItemFormSave } from '@/types';

// pull this out here so we can use the type in the return type of getListItemsByListId
const getListItemsQuery = (listId: string) =>
	db.query.listItems.findMany({
		where: eq(listItems.listId, listId),
		with: {
			ingredient: true,
			unit: true,
		},
	});

export type ListItemWithRelations = Awaited<ReturnType<typeof getListItemsQuery>>[number];

export async function getListItemsByListId(listId: string): Promise<ListItemWithRelations[]> {
	return await getListItemsQuery(listId);
}

export async function removeListItemById(itemId: string) {
	return await db.delete(listItems).where(eq(listItems.id, itemId));
}

export async function createListItem(itemData: ListItemFormSave, userId: string) {
	console.log(`Form data in createListItem: ${JSON.stringify(itemData, null, 4)} `);

	return await db.insert(listItems).values({
		...itemData,
		createdBy: userId,
	});
}

export async function updateListItem(itemId: string, itemData: ListItemFormSave, userId: string) {
	console.log(`Form data in updateListItem: ${JSON.stringify(itemData, null, 4)} `);

	return await db
		.update(listItems)
		.set({
			...itemData,
			updatedBy: userId,
		})
		.where(eq(listItems.id, itemId));
}
