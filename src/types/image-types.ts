import type { imageTypes } from '@/models';

export type ImageTypeDBRead = typeof imageTypes.$inferSelect;
export type ImageTypeWriteInput = Omit<
	typeof imageTypes.$inferInsert,
	'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
