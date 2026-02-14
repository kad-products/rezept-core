import type { seasons } from '@/models/seasons';

export type Season = typeof seasons.$inferSelect;
export type SeasonFormSave = Omit<
	typeof seasons.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
