import type { seasons } from '@/models/schema';

export type Season = typeof seasons.$inferSelect;
export type SeasonFormSave = Omit<
	typeof seasons.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
