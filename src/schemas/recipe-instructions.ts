import { z } from 'zod';
import { optionalUuid, requiredUuid } from './utils';

// Shared base fields for recipe instructions
const baseRecipeInstructionFields = {
	recipeSectionId: requiredUuid,
	stepNumber: z.coerce.number().int().min(1),
	instruction: z.string().trim().min(1, 'Instruction is required').max(2000, 'Instruction must be 2000 characters or less'),
};

// Create schema - no id, requires createdBy
export const createRecipeInstructionSchema = z.object({
	...baseRecipeInstructionFields,
	createdBy: requiredUuid,
});

// Update schema - requires id and updatedBy
export const updateRecipeInstructionSchema = z.object({
	...baseRecipeInstructionFields,
	id: requiredUuid,
	updatedBy: requiredUuid,
	deletedBy: optionalUuid,
});
