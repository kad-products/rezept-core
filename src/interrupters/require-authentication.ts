import { getRequestInfo } from 'rwsdk/worker';
import { RzAccessError } from '@/classes';

export function requireAuthentication(): void {
	const { ctx } = getRequestInfo();
	if (!ctx.user) {
		throw new RzAccessError(401, 'Authentication required');
	}
}
