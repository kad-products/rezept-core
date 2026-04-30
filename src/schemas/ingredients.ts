import { z } from 'zod';
import { optionalStringMax, optionalUuid, requiredString, requiredUuid } from './utils';

// Shared base fields
const baseIngredientFields = {
	name: requiredString('Name', 100),
	description: optionalStringMax(500, 'Description'),
};

// Create schema - no id, requires createdBy
const createSchema = z.object({
	...baseIngredientFields,
	createdBy: requiredUuid,
});

// Update schema - requires id and updatedBy
const updateSchema = z.object({
	...baseIngredientFields,
	id: requiredUuid,
	updatedBy: requiredUuid,
	deletedBy: optionalUuid,
});

export const ingredientsSchemas = {
	create: createSchema,
	update: updateSchema,
};
