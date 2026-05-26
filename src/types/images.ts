import type { images } from '@/models';

export type ImageDBRead = typeof images.$inferSelect;
export type ImageWriteInput = Omit<
	typeof images.$inferInsert,
	'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
