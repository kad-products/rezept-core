import { z } from 'zod';
import { optionalStringMax, requiredString } from './utils';

const formSchema = z.object({
	id: z.string().uuid('Must be a valid UUID').optional(),
	name: requiredString('Name', 100),
	description: optionalStringMax(500, 'Description'),
	hasSeasons: z.boolean().default(true),
});

const loadRecordSchema = z.object({
	id: z.string().uuid('Must be a valid UUID').optional(),
	name: requiredString('Name', 100),
	description: z.string().max(500, 'Description must be 500 characters or fewer').nullish(),
	hasSeasons: z.boolean().optional(),
});

export const ingredientsSchemas = {
	form: formSchema,
	loadRecord: loadRecordSchema,
};
