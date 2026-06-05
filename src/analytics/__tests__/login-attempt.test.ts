import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
	AED_LOGIN_ATTEMPTS: { writeDataPoint: vi.fn() },
}));

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

import { trackLoginAttempt } from '../login-attempt';

describe('trackLoginAttempt', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('writes a data point with type, stage, and success as blobs', () => {
		trackLoginAttempt({ type: 'PASSKEY', stage: 'START', success: true });

		expect(mockEnv.AED_LOGIN_ATTEMPTS.writeDataPoint).toHaveBeenCalledWith({
			indexes: ['unknown'],
			blobs: ['PASSKEY', 'START', 'true'],
		});
	});

	it('uses userId as the index when provided', () => {
		trackLoginAttempt({ type: 'PASSKEY', stage: 'FINISH', success: true, userId: 'user-123' });

		expect(mockEnv.AED_LOGIN_ATTEMPTS.writeDataPoint).toHaveBeenCalledWith({
			indexes: ['user-123'],
			blobs: ['PASSKEY', 'FINISH', 'true'],
		});
	});

	it('falls back to "unknown" when userId is not provided', () => {
		trackLoginAttempt({ type: 'PASSWORD', stage: 'START', success: false });

		const call = mockEnv.AED_LOGIN_ATTEMPTS.writeDataPoint.mock.calls[0][0];
		expect(call.indexes).toEqual(['unknown']);
	});

	// CF Analytics Engine has no native boolean type — success is serialised as a string so it
	// can be filtered in SQL queries: blob3 = 'true' / blob3 = 'false'
	it('serialises success as a string for SQL query compatibility', () => {
		trackLoginAttempt({ type: 'PASSKEY', stage: 'FINISH', success: false, userId: 'user-abc' });

		const call = mockEnv.AED_LOGIN_ATTEMPTS.writeDataPoint.mock.calls[0][0];
		expect(call.blobs[2]).toBe('false');
	});

	it('supports PASSWORD type', () => {
		trackLoginAttempt({ type: 'PASSWORD', stage: 'FINISH', success: true, userId: 'user-123' });

		expect(mockEnv.AED_LOGIN_ATTEMPTS.writeDataPoint).toHaveBeenCalledWith({
			indexes: ['user-123'],
			blobs: ['PASSWORD', 'FINISH', 'true'],
		});
	});
});
