import { z } from 'zod';
import { coercedInt, optionalString, requiredString, requiredUuid } from './utils';

// Shared base fields
const baseSchema = {
	userId: requiredUuid,
	credentialId: requiredString('Credential ID'),
	publicKey: z.instanceof(Uint8Array, { message: 'Public key must be a Uint8Array' }),
	counter: coercedInt(0).default(0),
	name: optionalString,
};

// Create schema - no id
const createSchema = z.object({
	...baseSchema,
});

// Update schema - requires id
const updateSchema = z.object({
	...baseSchema,
	id: requiredUuid,
	lastUsedAt: z.string().datetime().optional(),
});

export const credentialsSchemas = {
	create: createSchema,
	update: updateSchema,
};
