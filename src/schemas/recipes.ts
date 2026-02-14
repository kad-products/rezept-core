import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import { recipes } from '@/models';

export const createRecipeFormValidationSchema = createInsertSchema(recipes, {
	id: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	servings: z.coerce.number().min(1, { message: 'Servings must be at least 1' }).default(1),
	cookTime: z.coerce.number().min(0, { message: 'Cook time cannot be negative' }).default(0),
	prepTime: z.coerce.number().min(0, { message: 'Prep time cannot be negative' }).default(0),
}).omit({
	createdAt: true,
	createdBy: true,
	updatedAt: true,
	updatedBy: true,
	deletedAt: true,
	deletedBy: true,
});
