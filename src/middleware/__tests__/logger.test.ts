import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { expect, it, vi } from 'vitest';
import loggerMiddleware from '../logger';

vi.mock('cloudflare:workers', () => ({
	env: { LOG_LEVEL: 'info', LOG_LEVEL_TASK_OVERRIDE: '' },
}));

it('sets logger on ctx', async () => {
	const ctx = {} as DefaultAppContext;
	const request = new Request('https://example.com/test', { headers: { 'cf-ray': 'test-ray-id' } });
	await loggerMiddleware({ ctx, request } as RequestInfo<DefaultAppContext>);

	expect(ctx.logger).toBeDefined();
	expect(typeof ctx.logger.info).toBe('function');
	expect(typeof ctx.logger.child).toBe('function');
});
