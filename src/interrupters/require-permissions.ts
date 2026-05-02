import { getRequestInfo } from 'rwsdk/worker';
import { RzAccessError } from '@/classes';
import type { Permission } from '@/types';

export const requirePermissions = (...required: Permission[]): (() => Promise<void>) => {
	return async () => {
		const { ctx } = getRequestInfo();
		const missing = required.filter(p => !ctx.permissions?.includes(p));

		if (missing.length > 0) {
			throw new RzAccessError(403, 'Forbidden');
		}
	};
};
