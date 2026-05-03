import type { users } from '@/models';

export type UserDBRead = typeof users.$inferSelect;
export type UserWriteInput = Omit<
	typeof users.$inferInsert,
	'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
