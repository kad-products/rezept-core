import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import Logger from '../logger';

export default async function loggerMiddleware({ ctx }: RequestInfo<DefaultAppContext>) {
	ctx.logger = new Logger();
}
