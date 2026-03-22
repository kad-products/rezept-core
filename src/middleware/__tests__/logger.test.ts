import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { expect, it } from 'vitest';
import loggerMiddleware from '../logger';

it('sets logger on ctx', async () => {
	const ctx = {} as DefaultAppContext;
	await loggerMiddleware({ ctx } as RequestInfo<DefaultAppContext>);

	expect(ctx.logger).toBeDefined();
	expect(typeof ctx.logger.info).toBe('function');
});
