import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RzAccessError } from '@/classes';

const mockRequestInfo = {
	ctx: {
		user: null as { id: string; role?: string | null } | null,
	},
};

vi.mock('rwsdk/worker', () => ({
	get requestInfo() {
		return mockRequestInfo;
	},
	getRequestInfo: () => mockRequestInfo,
}));

import { requireAuthentication } from '@/interrupters';

describe('requireAuthentication', () => {
	beforeEach(() => {
		mockRequestInfo.ctx.user = null;
	});

	it('returns undefined when user is present', () => {
		mockRequestInfo.ctx.user = { id: 'user-123' };

		expect(() => requireAuthentication()).not.toThrow();
		expect(requireAuthentication()).toBeUndefined();
	});

	it('throws RzAccessError 401 when user is null', () => {
		mockRequestInfo.ctx.user = null;

		expect(() => requireAuthentication()).toThrow(RzAccessError);
		expect(() => requireAuthentication()).toThrow(expect.objectContaining({ code: 401 }));
	});

	it('throws RzAccessError 401 when user is undefined', () => {
		mockRequestInfo.ctx.user = undefined as any;

		expect(() => requireAuthentication()).toThrow(RzAccessError);
		expect(() => requireAuthentication()).toThrow(expect.objectContaining({ code: 401 }));
	});
});
