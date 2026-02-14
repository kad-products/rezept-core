import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import { recipeInstructions } from '@/models';

export const createRecipeInstructionFormValidationSchema = createInsertSchema(recipeInstructions, {
	id: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	stepNumber: z.coerce.number().min(0).default(0),
	instruction: z.string().min(1, 'Instruction is required'),
}).omit({
	createdAt: true,
	createdBy: true,
	updatedAt: true,
	updatedBy: true,
	deletedAt: true,
	deletedBy: true,
});
