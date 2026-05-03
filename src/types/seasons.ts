import type { seasons } from '@/models';

export type SeasonDBRead = typeof seasons.$inferSelect;
export type SeasonWriteInput = Omit<
	typeof seasons.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

export type SeasonFormData = {
	name: string;
	id?: string | undefined;
	description?: string | undefined | null;
	country: string;
	region?: string | null;
	startMonth: number;
	endMonth: number;
	notes?: string | null;
	ingredients?: string[];
};
