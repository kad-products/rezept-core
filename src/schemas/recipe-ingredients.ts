import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import { recipeIngredients } from '@/models';

export const createRecipeIngredientFormValidationSchema = createInsertSchema(recipeIngredients, {
	id: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	order: z.coerce.number().min(0).default(0),
	quantity: z.coerce.number().min(1),
}).omit({
	createdAt: true,
	createdBy: true,
	updatedAt: true,
	updatedBy: true,
	deletedAt: true,
	deletedBy: true,
});
