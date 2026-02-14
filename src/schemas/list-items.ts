import { z } from 'zod';
import { listItemStatusEnum } from '@/models';
import { optionalUuid, requiredUuid } from './utils';

// Shared base fields
const baseListItemFields = {
	listId: requiredUuid,
	ingredientId: requiredUuid,
	quantity: z.coerce.number().positive().multipleOf(0.01).optional(),
	status: z.enum(listItemStatusEnum),
	unitId: optionalUuid,
};

// Create schema - no id, requires createdBy
export const createListItemSchema = z.object({
	...baseListItemFields,
	createdBy: requiredUuid,
});

// Update schema - requires id, no createdBy
export const updateListItemSchema = z.object({
	...baseListItemFields,
	id: requiredUuid,
	updatedBy: requiredUuid,
	deletedBy: optionalUuid,
});
