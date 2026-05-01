import { z } from 'zod';
import { permissionValues } from '@/data/permissions';
import { requiredUuid } from './utils';

const formSchema = z.object({
	id: z
		.union([z.string().uuid('Must be a valid UUID'), z.literal('')])
		.transform(val => (val === '' ? undefined : val))
		.optional(), // Present for update, absent for create
	userId: requiredUuid,
	name: z.string(),
	permissions: z.array(z.enum(permissionValues)).min(1, 'At least one permission is required'),
	revokeAt: z.string().datetime().optional(),
});

export const apiKeysSchemas = {
	form: formSchema,
};
