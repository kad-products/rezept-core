import { z } from 'zod';
import { optionalStringMax, requiredString } from './utils';

const formSchema = z.object({
	id: z.string().uuid('Must be a valid UUID').optional(),
	name: requiredString('Name', 100),
	description: optionalStringMax(500, 'Description'),
	hasSeasons: z.boolean(),
});

export const ingredientsSchemas = {
	form: formSchema,
};
