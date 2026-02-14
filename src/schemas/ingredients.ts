// src/schemas/ingredient.ts
import { z } from 'zod';
import { optionalString, optionalUuid, requiredUuid } from './utils';

// Shared base fields
const baseIngredientFields = {
	name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be 100 characters or less'),
	description: optionalString
		.transform(val => val?.trim())
		.pipe(z.string().max(500, 'Description must be 500 characters or less').optional()),
};

// Create schema - no id, requires createdBy
export const createIngredientSchema = z.object({
	...baseIngredientFields,
	createdBy: requiredUuid,
});

// Update schema - requires id and updatedBy
export const updateIngredientSchema = z.object({
	...baseIngredientFields,
	id: requiredUuid,
	updatedBy: requiredUuid,
	deletedBy: optionalUuid,
});
