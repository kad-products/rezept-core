import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import Logger from '@/logger';

export default function loggerMiddleware({ ctx }: RequestInfo<DefaultAppContext>): void {
	ctx.logger = new Logger();
}
