import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { getRequestInfo } from 'rwsdk/worker';
import permissions from '@/data/permissions';
import type { Permission } from '@/types';

const flattenedPermissions: Array<{ permission: string; roles: string[] }> = Object.entries(permissions).flatMap(
	([resource, actions]) =>
		Object.entries(actions).map(([action, roles]) => ({
			permission: `${resource}:${action}`,
			roles,
		})),
);

export default async function permissionsMiddleware({ ctx }: RequestInfo<DefaultAppContext>): Promise<void> {
	if (ctx.apiKey) {
		ctx.permissions = ctx.apiKey.permissions;
		return;
	}

	let role = 'PUBLIC';
	if (ctx.user?.role) {
		role = ctx.user.role;
	}
	ctx.permissions = flattenedPermissions.filter(p => p.roles.includes('*') || p.roles.includes(role)).map(p => p.permission);
}

export const requirePermissions = (...required: Permission[]): (() => Promise<Response | undefined>) => {
	return async () => {
		const { ctx } = getRequestInfo();
		const missing = required.filter(p => !ctx.permissions?.includes(p));

		if (missing.length > 0) {
			return Response.json(
				{ error: 'Forbidden', missing },
				{
					status: 403,
					headers: { 'Content-Type': 'application/json' },
				},
			);
		}
	};
};
