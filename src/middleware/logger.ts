import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { createRequestLogger } from '@/logger';

export default function loggerMiddleware({ ctx, request }: RequestInfo<DefaultAppContext>): void {
	ctx.logger = createRequestLogger(request);
}
