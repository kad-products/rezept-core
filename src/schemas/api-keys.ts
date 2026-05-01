import { z } from 'zod';
import permissions from '@/data/permissions';
import type { PermissionKey } from '@/types';
import { requiredUuid } from './utils';

const permissionValues = Object.entries(permissions).flatMap(([resource, actions]) =>
	Object.keys(actions).map(action => `${resource}:${action}`),
) as [PermissionKey, ...PermissionKey[]];

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
