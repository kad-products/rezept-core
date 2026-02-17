import { beforeEach, describe, expect, it, vi } from 'vitest';
import headerMiddleware from '../headers';

const mockRequestInfo = {
	response: {
		headers: new Headers(),
	},
	rw: {
		nonce: 'test-nonce',
	},
};

describe('headerMiddleware', () => {
	beforeEach(() => {
		mockRequestInfo.response.headers = new Headers();
	});

	it('sets X-Content-Type-Options header', () => {
		headerMiddleware(mockRequestInfo as any);
		expect(mockRequestInfo.response.headers.get('X-Content-Type-Options')).toBe('nosniff');
	});

	it('sets Referrer-Policy header', () => {
		headerMiddleware(mockRequestInfo as any);
		expect(mockRequestInfo.response.headers.get('Referrer-Policy')).toBe('no-referrer');
	});

	it('sets Permissions-Policy header', () => {
		headerMiddleware(mockRequestInfo as any);
		expect(mockRequestInfo.response.headers.get('Permissions-Policy')).toBe('geolocation=(), microphone=(), camera=()');
	});

	it('sets Content-Security-Policy header with nonce', () => {
		headerMiddleware(mockRequestInfo as any);
		const csp = mockRequestInfo.response.headers.get('Content-Security-Policy');
		expect(csp).toContain('nonce-test-nonce');
		expect(csp).toContain("default-src 'self'");
	});

	describe('Strict-Transport-Security', () => {
		it('sets HSTS header when not dev server', () => {
			vi.stubEnv('VITE_IS_DEV_SERVER', '');
			headerMiddleware(mockRequestInfo as any);
			expect(mockRequestInfo.response.headers.get('Strict-Transport-Security')).toBe(
				'max-age=63072000; includeSubDomains; preload',
			);
			vi.unstubAllEnvs();
		});

		it('does not set HSTS header in dev server', () => {
			vi.stubEnv('VITE_IS_DEV_SERVER', 'true');
			headerMiddleware(mockRequestInfo as any);
			expect(mockRequestInfo.response.headers.get('Strict-Transport-Security')).toBeNull();
			vi.unstubAllEnvs();
		});
	});
});
