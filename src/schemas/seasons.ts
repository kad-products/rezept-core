import { z } from 'zod';
import { validCountryCodes } from '@/data/countries';
import { coercedInt, optionalString, optionalStringMax, requiredString, requiredUuid } from './utils';

const formSchema = z.object({
	id: z.string().uuid('Must be a valid UUID').optional(),
	name: requiredString('Name'),
	description: optionalStringMax(500, 'Description'),
	country: z
		.string()
		.trim()
		.length(2, 'Country must be a 2-letter code')
		.refine(code => validCountryCodes.includes(code.toUpperCase()), { message: 'Invalid country code' }),
	region: optionalString,
	startMonth: coercedInt(1, 12),
	endMonth: coercedInt(1, 12),
	notes: optionalStringMax(2000, 'Notes'),
	ingredients: z.array(requiredUuid).default([]),
});

export const seasonsSchemas = {
	form: formSchema,
};
