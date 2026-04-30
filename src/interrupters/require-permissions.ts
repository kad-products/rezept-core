import { getRequestInfo } from 'rwsdk/worker';
import type { Permission } from '@/types';

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
