import { z } from 'zod';
import permissions from '@/data/permissions';
import { requiredUuid } from './utils';

type PermissionKey = {
	[K in keyof typeof permissions]: `${K & string}:${keyof (typeof permissions)[K] & string}`;
}[keyof typeof permissions];

const permissionValues = Object.entries(permissions).flatMap(([resource, actions]) =>
	Object.keys(actions).map(action => `${resource}:${action}`),
) as [PermissionKey, ...PermissionKey[]];

export const apiKeyFormSchema = z.object({
	id: z
		.union([z.string().uuid('Must be a valid UUID'), z.literal('')])
		.transform(val => (val === '' ? undefined : val))
		.optional(), // Present for update, absent for create
	userId: requiredUuid,
	name: z.string(),
	permissions: z.array(z.enum(permissionValues)).min(1, 'At least one permission is required'),
	revokeAt: z.string().datetime().optional(),
});
