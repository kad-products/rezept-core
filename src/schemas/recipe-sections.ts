import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import { recipeSections } from '@/models';

export const createRecipeSectionFormValidationSchema = createInsertSchema(recipeSections, {
	id: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	order: z.coerce.number().min(0).default(0),
}).omit({
	createdAt: true,
	createdBy: true,
	updatedAt: true,
	updatedBy: true,
	deletedAt: true,
	deletedBy: true,
});
