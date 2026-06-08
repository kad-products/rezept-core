import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { flattenedPermissions } from '@/data/permissions';
import type { PermissionRole } from '@/data/roles';
import type { Permission } from '@/types';

export default function permissionsMiddleware({ ctx }: RequestInfo<DefaultAppContext>): void {
	if (
		ctx.session?.permissionsOverride &&
		Array.isArray(ctx.session.permissionsOverride) &&
		ctx.session?.permissionsOverride.length > 0
	) {
		ctx.permissions = ctx.session.permissionsOverride;
		return;
	}

	if (ctx.apiKey) {
		// API key permissions are validated as Permission strings on creation; cast to narrow from string[]
		ctx.permissions = ctx.apiKey.permissions as Permission[];
		return;
	}

	let role: PermissionRole = 'PUBLIC';
	if (ctx.user?.role) {
		role = ctx.user.role;
	}
	ctx.permissions = flattenedPermissions.filter(p => p.roles.includes('*') || p.roles.includes(role)).map(p => p.permission);
}
