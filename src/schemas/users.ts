import { z } from 'zod';
import { requiredUuid } from './utils';

// Shared base fields
const baseUserFields = {
	username: z.string().trim().min(1, 'Username is required').max(50, 'Username must be 50 characters or less'),
};

// Create schema - no id or timestamps
const createSchema = z.object({
	...baseUserFields,
});

// Update schema - requires id
const updateSchema = z.object({
	...baseUserFields,
	id: requiredUuid,
});

export const usersSchemas = {
	create: createSchema,
	update: updateSchema,
};
