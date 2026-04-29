import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import Logger from '../logger';

export default async function loggerMiddleware({ ctx }: RequestInfo<DefaultAppContext>): Promise<void> {
	ctx.logger = new Logger();
}
