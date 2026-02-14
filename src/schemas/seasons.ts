import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { seasons } from '@/models';

export const createSeasonFormValidationSchema = createInsertSchema(seasons, {
	id: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	startMonth: z.coerce.number().min(1).max(12),
	endMonth: z.coerce.number().min(1).max(12),
}).omit({
	createdAt: true,
	createdBy: true,
	updatedAt: true,
	updatedBy: true,
	deletedAt: true,
	deletedBy: true,
});
