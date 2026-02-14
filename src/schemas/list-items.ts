import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { listItemStatusEnum, listItems } from '@/models';

export const createListItemFormValidationSchema = createInsertSchema(listItems, {
	id: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	quantity: z.coerce.number().positive().optional(),
	status: z.enum(listItemStatusEnum).default('NEEDED'),
	ingredientId: z.string().min(1, 'Ingredient is required'),
	unitId: z
		.string()
		.min(1)
		.optional()
		.or(z.literal(''))
		.transform(val => (val === '' ? undefined : val)),
}).omit({
	createdAt: true,
	createdBy: true,
	updatedAt: true,
	updatedBy: true,
	deletedAt: true,
	deletedBy: true,
});
