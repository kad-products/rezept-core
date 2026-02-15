import type { listItems } from '@/models';

export type ListItem = typeof listItems.$inferSelect;
export type ListItemFormSave = Omit<
	typeof listItems.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
