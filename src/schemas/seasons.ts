import { z } from 'zod';
import { validCountryCodes } from '@/data/countries';
import { optionalString, optionalUuid, requiredUuid } from './utils';

// Shared base fields
const baseSeasonFields = {
	name: z.string().trim().min(1, 'Name is required'),
	description: optionalString
		.transform(val => val?.trim())
		.pipe(z.string().max(500, 'Description must be 500 characters or less').optional()),
	country: z
		.string()
		.trim()
		.length(2, 'Country must be a 2-letter code')
		.refine(code => validCountryCodes.includes(code.toUpperCase()), { message: 'Invalid country code' }),
	region: optionalString.transform(val => val?.trim()),
	startMonth: z.coerce.number().int().min(1).max(12) as z.ZodNumber,
	endMonth: z.coerce.number().int().min(1).max(12) as z.ZodNumber,
	notes: optionalString
		.transform(val => val?.trim())
		.pipe(z.string().max(2000, 'Notes must be 2000 characters or less').optional()),
	ingredients: z.array(requiredUuid).default([]),
};

// Create schema - no id, requires createdBy
export const createSeasonSchema = z.object({
	...baseSeasonFields,
	createdBy: requiredUuid,
});

// Update schema - requires id and updatedBy
export const updateSeasonSchema = z.object({
	...baseSeasonFields,
	id: requiredUuid,
	updatedBy: requiredUuid,
	deletedBy: optionalUuid,
});
