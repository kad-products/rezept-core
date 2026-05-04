import type { z } from 'zod';
import type { seasons } from '@/models';
import type { seasonsSchemas } from '@/schemas';

export type SeasonDBRead = typeof seasons.$inferSelect;
export type SeasonWriteInput = Omit<
	typeof seasons.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

export type SeasonFormInput = z.input<typeof seasonsSchemas.form>;
