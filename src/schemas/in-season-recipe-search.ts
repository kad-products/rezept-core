import { z } from 'zod';

const formSchema = z.object({
	growingZoneId: z.string().uuid('Must be a valid UUID'),
	recipeSearchTerm: z.string().optional(),
	searchMonth: z.string().transform(Number).pipe(z.number().int().min(1).max(12)),
});

export const inSeasonRecipeSearchSchemas = {
	form: formSchema,
};
