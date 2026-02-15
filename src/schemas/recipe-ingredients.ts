import { z } from 'zod';
import { optionalString, optionalUuid, requiredUuid } from './utils';

// Shared base fields for recipe ingredients
const baseRecipeIngredientFields = {
	recipeSectionId: requiredUuid,
	ingredientId: requiredUuid,
	quantity: z.coerce.number().positive().multipleOf(0.01).optional(), // nullable for "to taste"
	unitId: optionalUuid,
	preparation: optionalString
		.transform(val => val?.trim())
		.pipe(z.string().max(100, 'Preparation must be 100 characters or less').optional()),
	modifier: optionalString
		.transform(val => val?.trim())
		.pipe(z.string().max(100, 'Modifier must be 100 characters or less').optional()),
	order: z.coerce.number().int().min(0),
};

// Create schema - no id, requires createdBy
export const createRecipeIngredientSchema = z.object({
	...baseRecipeIngredientFields,
	createdBy: requiredUuid,
});

// Update schema - requires id and updatedBy
export const updateRecipeIngredientSchema = z.object({
	...baseRecipeIngredientFields,
	id: requiredUuid,
	updatedBy: requiredUuid,
	deletedBy: optionalUuid,
});
