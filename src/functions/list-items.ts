'use server';
import removeListItemById from '@/repositories/list-items';

export async function removeListItem(itemId: string) {
  return await removeListItemById(itemId);
}