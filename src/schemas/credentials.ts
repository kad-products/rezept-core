import { z } from 'zod';
import { optionalString, requiredUuid } from './utils';

// Shared base fields
const baseCredentialFields = {
	userId: requiredUuid,
	credentialId: z.string().trim().min(1, 'Credential ID is required'),
	publicKey: z.instanceof(Uint8Array, { message: 'Public key must be a Uint8Array' }),
	counter: z.coerce.number().int().min(0).default(0),
	name: optionalString.transform(val => val?.trim()),
};

// Create schema - no id
export const createCredentialSchema = z.object({
	...baseCredentialFields,
});

// Update schema - requires id
export const updateCredentialSchema = z.object({
	...baseCredentialFields,
	id: requiredUuid,
	lastUsedAt: z.string().datetime().optional(),
});
