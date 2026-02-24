import { describe, expect, it } from 'vitest';
import botMiddleware from '../bot';

describe('botMiddleware', () => {
	it('returns 405 for installHook.js.map requests', () => {
		const mockRequestInfo = {
			request: new Request('https://example.com/installHook.js.map'),
		};

		const result = botMiddleware(mockRequestInfo as any);

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).status).toBe(405);
	});

	it('is case-insensitive for installHook.js.map', () => {
		const mockRequestInfo = {
			request: new Request('https://example.com/INSTALLHOOK.JS.MAP'),
		};

		const result = botMiddleware(mockRequestInfo as any);

		expect(result).toBeInstanceOf(Response);
		expect((result as Response).status).toBe(405);
	});

	it('returns undefined for normal requests', () => {
		const mockRequestInfo = {
			request: new Request('https://example.com/some-other-path'),
		};

		const result = botMiddleware(mockRequestInfo as any);

		expect(result).toBeUndefined();
	});
});
