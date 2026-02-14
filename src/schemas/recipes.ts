import { z } from 'zod';
import { optionalString, optionalUuid, requiredUuid } from './utils';

// Shared base fields for recipes
const baseRecipeFields = {
	authorId: requiredUuid,
	title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
	description: optionalString
		.transform(val => val?.trim())
		.pipe(z.string().max(1000, 'Description must be 1000 characters or less').optional()),
	source: optionalString
		.transform(val => val?.trim())
		.pipe(z.string().max(500, 'Source must be 500 characters or less').optional()),
	servings: z.coerce.number().int().positive().optional(),
	prepTime: z.coerce.number().int().min(0).optional(), // minutes
	cookTime: z.coerce.number().int().min(0).optional(), // minutes
};

// Create schema - no id, requires createdBy
export const createRecipeSchema = z.object({
	...baseRecipeFields,
	createdBy: requiredUuid,
});

// Update schema - requires id and updatedBy
export const updateRecipeSchema = z.object({
	...baseRecipeFields,
	id: requiredUuid,
	updatedBy: requiredUuid,
	deletedBy: optionalUuid,
});
