import type { Permission } from '@/types/permissions';
import type { PermissionRole } from './roles';

type RoleEntry = PermissionRole | '*';

// biome-ignore lint/nursery/useExplicitType: This is a constant and a data source/inference source for other types so we can't type this without causing problems in those
const permissions = {
	placeholder: {
		public: ['*'],
	},
	admin: {
		read: ['ADMIN'],
	},
	'api-keys': {
		copy: ['BASIC', 'ADMIN'],
		create: ['BASIC', 'ADMIN'],
		read: ['BASIC', 'ADMIN'],
		update: ['BASIC', 'ADMIN'],
		delete: ['BASIC', 'ADMIN'],
	},
	auth: {
		login: ['PUBLIC'],
		logout: ['ADMIN', 'BASIC'],
	},
	credentials: {
		read: ['BASIC', 'ADMIN'],
	},
	ingredients: {
		create: ['ADMIN', 'BASIC'],
		read: ['*'],
		update: ['ADMIN', 'BASIC'],
		delete: ['ADMIN', 'BASIC'],
	},
	permissions: {
		override: ['ADMIN'],
	},
	profile: {
		read: ['ADMIN', 'BASIC'],
	},
	recipes: {
		create: ['ADMIN', 'BASIC'],
		read: ['*'],
		update: ['ADMIN', 'BASIC'],
		delete: ['ADMIN', 'BASIC'],
		scrape: ['ADMIN', 'BASIC'],
		upload: ['ADMIN', 'BASIC'],
		favorite: ['ADMIN', 'BASIC'],
	},
	seasons: {
		create: ['ADMIN'],
		read: ['*'],
		update: ['ADMIN'],
		delete: ['ADMIN'],
	},
	users: {
		read: ['ADMIN'],
		update: ['ADMIN'],
	},
} as const satisfies Record<string, Record<string, RoleEntry[]>>;

export default permissions;

export const flattenedPermissions: Array<{ permission: Permission; roles: string[] }> = Object.entries(permissions).flatMap(
	([resource, actions]) =>
		Object.entries(actions).map(([action, roles]) => ({
			permission: `${resource}:${action}` as Permission,
			roles: roles as string[],
		})),
);

type PermissionKey = {
	[K in keyof typeof permissions]: `${K & string}:${keyof (typeof permissions)[K] & string}`;
}[keyof typeof permissions];

export const permissionValues = Object.entries(permissions).flatMap(([resource, actions]) =>
	Object.keys(actions).map(action => `${resource}:${action}`),
) as [PermissionKey, ...PermissionKey[]];
