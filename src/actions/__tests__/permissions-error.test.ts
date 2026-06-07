/**
 * Regression test for issue #73 — access errors in action/page chains should
 * produce the right response shape, not an unhandled exception that kills the worker.
 *
 * handlePageError branches on request type (not error class):
 * - Server action requests (__rsc_action_id query param) → JSON ActionState
 * - Page navigation requests → React RootErrorHandler component
 */
import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';
import { describe, expect, it } from 'vitest';
import { RzAccessError } from '@/classes';
import { createNoopLogger } from '@/logger';
import { handlePageError } from '../../worker-error';

function makeReqInfo(url: string): RequestInfo<DefaultAppContext> {
	return {
		request: new Request(url),
		ctx: { logger: createNoopLogger() } as DefaultAppContext,
	} as unknown as RequestInfo<DefaultAppContext>;
}

const actionReqInfo = makeReqInfo('https://example.com/recipes?__rsc_action_id=abc123');
const pageReqInfo = makeReqInfo('https://example.com/recipes');

describe('handlePageError — server action requests', () => {
	it('returns JSON 403 for RzAccessError(403)', async () => {
		const result = handlePageError(new RzAccessError(403, 'Forbidden'), actionReqInfo);
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).status).toBe(403);
		const body = await (result as Response).json();
		expect(body).toMatchObject({ success: false, code: 403 });
	});

	it('returns JSON 401 for RzAccessError(401)', async () => {
		const result = handlePageError(new RzAccessError(401, 'Authentication required'), actionReqInfo);
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).status).toBe(401);
		const body = await (result as Response).json();
		expect(body).toMatchObject({ success: false, code: 401 });
	});

	it('returns JSON 500 for unexpected errors', async () => {
		const result = handlePageError(new Error('Something exploded'), actionReqInfo);
		expect(result).toBeInstanceOf(Response);
		expect((result as Response).status).toBe(500);
		const body = await (result as Response).json();
		expect(body).toMatchObject({ success: false, code: 500 });
	});
});

describe('handlePageError — page navigation requests', () => {
	it('passes RzAccessError to RootErrorHandler (not a Response)', () => {
		const result = handlePageError(new RzAccessError(403, 'Forbidden'), pageReqInfo);
		expect(result).not.toBeInstanceOf(Response);
	});

	it('passes unexpected errors to RootErrorHandler too', () => {
		const result = handlePageError(new Error('Something unexpected'), pageReqInfo);
		expect(result).not.toBeInstanceOf(Response);
	});
});
