import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { flattenedPermissions } from '@/data/permissions';
import type { PermissionRole } from '@/data/roles';

export default async function permissionsMiddleware({ ctx }: RequestInfo<DefaultAppContext>): Promise<void> {
	if (ctx.apiKey) {
		ctx.permissions = ctx.apiKey.permissions;
		return;
	}

	let role: PermissionRole = 'PUBLIC';
	if (ctx.user?.role) {
		role = ctx.user.role;
	}
	ctx.permissions = flattenedPermissions.filter(p => p.roles.includes('*') || p.roles.includes(role)).map(p => p.permission);
}
