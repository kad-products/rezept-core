import { getRequestInfo } from 'rwsdk/worker';
import { RzAccessError } from '@/classes';
import type { Permission } from '@/types';

export const requirePermissions = (...required: Permission[]): (() => Promise<void>) => {
	if (required.length === 0) {
		throw new Error(`Required permission check requires at least one permission`);
	}
	return async () => {
		const { ctx } = getRequestInfo();
		const missing = required.filter(p => !ctx.permissions?.includes(p));

		if (missing.length > 0) {
			throw new RzAccessError(403, 'Forbidden');
		}
	};
};
