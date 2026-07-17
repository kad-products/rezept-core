import { z } from 'zod';

const formSchema = z.object({
	growingZoneId: z.string().uuid('Must be a valid UUID'),
	recipeSearchTerm: z.string().optional(),
});

export const inSeasonRecipeSearchSchemas = {
	form: formSchema,
};
