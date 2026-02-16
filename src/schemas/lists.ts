import { z } from 'zod';
import { optionalUuid, requiredUuid } from './utils';

// Shared base fields
const baseListFields = {
	userId: requiredUuid,
	name: z.string().trim().min(1, 'Name is required').max(200, 'Name must be 200 characters or less'),
};

// Create schema - no id, requires createdBy
export const createListSchema = z.object({
	...baseListFields,
	createdBy: requiredUuid,
});

// Update schema - requires id and updatedBy
export const updateListSchema = z.object({
	...baseListFields,
	id: requiredUuid,
	updatedBy: requiredUuid,
	deletedBy: optionalUuid,
});
