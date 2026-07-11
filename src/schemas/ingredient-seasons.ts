import { z } from 'zod';
import { validCountryCodes } from '@/data/countries';
import { coercedInt, optionalString, optionalStringMax, requiredUuid } from './utils';

const formSchema = z.object({
	id: z.string().uuid('Must be a valid UUID').optional(),
	ingredientId: requiredUuid,
	country: z
		.string()
		.trim()
		.length(3, 'Country must be a 3-letter code')
		.refine(code => validCountryCodes.includes(code.toUpperCase()), { message: 'Invalid country code' }),
	region: optionalString,
	startMonth: coercedInt(1, 12),
	endMonth: coercedInt(1, 12),
	notes: optionalStringMax(2000, 'Notes'),
});

export const ingredientSeasonsSchemas = {
	form: formSchema,
};
