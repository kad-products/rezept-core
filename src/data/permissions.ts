const permissions = {
	'api-keys': {
		create: ['BASIC', 'ADMIN'],
		read: ['BASIC', 'ADMIN'],
		update: ['BASIC', 'ADMIN'],
		delete: ['BASIC', 'ADMIN'],
	},
	auth: {
		login: ['PUBLIC'],
		logout: ['ADMIN', 'BASIC'],
	},
	ingredients: {
		create: ['ADMIN', 'BASIC'],
		read: ['*'],
		update: ['ADMIN', 'BASIC'],
		delete: ['ADMIN', 'BASIC'],
	},
	profile: {
		read: ['ADMIN', 'BASIC'],
	},
	seasons: {
		create: ['ADMIN'],
		read: ['*'],
		update: ['ADMIN'],
		delete: ['ADMIN'],
	},
	jobs: {
		trigger: ['ADMIN'],
		read: ['ADMIN'],
	},
	recipes: {
		create: ['ADMIN', 'BASIC'],
		read: ['*'],
		update: ['ADMIN', 'BASIC'],
		delete: ['ADMIN', 'BASIC'],
		scrape: ['ADMIN', 'BASIC'],
		upload: ['ADMIN', 'BASIC'],
	},
} as const;

export default permissions;

export const flattenedPermissions: Array<{ permission: string; roles: string[] }> = Object.entries(permissions).flatMap(
	([resource, actions]) =>
		Object.entries(actions).map(([action, roles]) => ({
			permission: `${resource}:${action}`,
			roles,
		})),
);

type PermissionKey = {
	[K in keyof typeof permissions]: `${K & string}:${keyof (typeof permissions)[K] & string}`;
}[keyof typeof permissions];

export const permissionValues = Object.entries(permissions).flatMap(([resource, actions]) =>
	Object.keys(actions).map(action => `${resource}:${action}`),
) as [PermissionKey, ...PermissionKey[]];
