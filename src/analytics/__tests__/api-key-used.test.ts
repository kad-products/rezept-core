import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({
	AED_API_KEY_USED: { writeDataPoint: vi.fn() },
}));

vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

import { trackApiKeyUsed } from '../api-key-used';

describe('trackApiKeyUsed', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('writes a data point with path, method, and valid as blobs', () => {
		trackApiKeyUsed({ userId: 'user-123', path: '/api/recipes', method: 'GET', valid: true });

		expect(mockEnv.AED_API_KEY_USED.writeDataPoint).toHaveBeenCalledWith({
			indexes: ['user-123'],
			blobs: ['/api/recipes', 'GET', 'true'],
		});
	});

	it('uses userId as the index', () => {
		trackApiKeyUsed({ userId: 'user-abc', path: '/api/test', method: 'POST', valid: false });

		const call = mockEnv.AED_API_KEY_USED.writeDataPoint.mock.calls[0][0];
		expect(call.indexes).toEqual(['user-abc']);
	});

	// CF Analytics Engine has no native boolean type — valid is serialised as a string so it
	// can be filtered in SQL queries: blob3 = 'true' / blob3 = 'false'
	it('serialises valid: false as the string "false" for SQL query compatibility', () => {
		trackApiKeyUsed({ userId: 'user-123', path: '/api/test', method: 'DELETE', valid: false });

		const call = mockEnv.AED_API_KEY_USED.writeDataPoint.mock.calls[0][0];
		expect(call.blobs[2]).toBe('false');
	});

	it('serialises valid: true as the string "true"', () => {
		trackApiKeyUsed({ userId: 'user-123', path: '/api/test', method: 'GET', valid: true });

		const call = mockEnv.AED_API_KEY_USED.writeDataPoint.mock.calls[0][0];
		expect(call.blobs[2]).toBe('true');
	});

	it('includes the HTTP method in blobs', () => {
		trackApiKeyUsed({ userId: 'user-123', path: '/api/recipes/import', method: 'POST', valid: true });

		const call = mockEnv.AED_API_KEY_USED.writeDataPoint.mock.calls[0][0];
		expect(call.blobs[1]).toBe('POST');
	});
});
