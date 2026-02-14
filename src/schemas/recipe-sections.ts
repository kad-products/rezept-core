import { z } from 'zod';
import { optionalString, optionalUuid, requiredUuid } from './utils';

// Shared base fields for recipe sections
const baseRecipeSectionFields = {
	recipeId: requiredUuid,
	title: optionalString
		.transform(val => val?.trim())
		.pipe(z.string().max(200, 'Title must be 200 characters or less').optional()),
	order: z.coerce.number().int().min(0),
};

// Create schema - no id, requires createdBy
export const createRecipeSectionSchema = z.object({
	...baseRecipeSectionFields,
	createdBy: requiredUuid,
});

// Update schema - requires id and updatedBy
export const updateRecipeSectionSchema = z.object({
	...baseRecipeSectionFields,
	id: requiredUuid,
	updatedBy: requiredUuid,
	deletedBy: optionalUuid,
});
