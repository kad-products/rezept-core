import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { getRequestInfo } from 'rwsdk/worker';
import type { Permission } from '@/types';

export const permissions = {
	seasons: {
		create: ['ADMIN'],
		read: ['*'],
		update: ['ADMIN'],
		delete: ['ADMIN'],
	},
	recipes: {
		create: ['ADMIN', 'BASIC'],
		read: ['*'],
		update: ['ADMIN', 'BASIC'],
		delete: ['ADMIN', 'BASIC'],
	},
};

export function flattenPermissions(perms: typeof permissions) {
	const flattened: Array<{ permission: string; roles: string[] }> = [];

	for (const [resource, actions] of Object.entries(perms)) {
		for (const [action, roles] of Object.entries(actions)) {
			flattened.push({
				permission: `${resource}:${action}`,
				roles,
			});
		}
	}

	return flattened;
}

const flattenedPermissions = flattenPermissions(permissions);

export default async function permissionsMiddleware({ ctx }: RequestInfo<DefaultAppContext>) {
	let role = 'PUBLIC';
	if (ctx.user?.role) {
		role = ctx.user.role;
	}
	ctx.permissions = flattenedPermissions.filter(p => p.roles.includes('*') || p.roles.includes(role)).map(p => p.permission);
}

export const requirePermissions = (...required: Permission[]) => {
	return async () => {
		const { ctx } = getRequestInfo();
		const missing = required.filter(p => !ctx.permissions?.includes(p));

		if (missing.length > 0) {
			return new Response(JSON.stringify({ error: 'Forbidden', missing }), {
				status: 403,
				headers: { 'Content-Type': 'application/json' },
			});
		}
	};
};
