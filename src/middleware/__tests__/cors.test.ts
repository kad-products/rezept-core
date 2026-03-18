import { describe, expect, it } from 'vitest';
import corsMiddleware from '../cors';

function makeRequestInfo(method: string, url: string, origin?: string) {
	const headers = new Headers();
	if (origin) headers.set('Origin', origin);
	return {
		request: new Request(url, { method, headers }),
	} as any;
}

describe('corsMiddleware', () => {
	describe('OPTIONS on allowed path', () => {
		it('returns 204 for OPTIONS on bookmarklet endpoint', () => {
			const result = corsMiddleware(
				makeRequestInfo('OPTIONS', 'https://example.com/api/recipes/scrape', 'https://www.allrecipes.com'),
			);

			expect(result).toBeInstanceOf(Response);
			expect((result as Response).status).toBe(204);
		});

		it('echoes the Origin header in Access-Control-Allow-Origin', () => {
			const result = corsMiddleware(
				makeRequestInfo('OPTIONS', 'https://example.com/api/recipes/scrape', 'https://www.allrecipes.com'),
			) as Response;

			expect(result.headers.get('Access-Control-Allow-Origin')).toBe('https://www.allrecipes.com');
		});

		it('falls back to * when no Origin header is present', () => {
			const result = corsMiddleware(makeRequestInfo('OPTIONS', 'https://example.com/api/recipes/scrape')) as Response;

			expect(result.headers.get('Access-Control-Allow-Origin')).toBe('*');
		});

		it('sets Access-Control-Allow-Credentials to true', () => {
			const result = corsMiddleware(
				makeRequestInfo('OPTIONS', 'https://example.com/api/recipes/scrape', 'https://www.allrecipes.com'),
			) as Response;

			expect(result.headers.get('Access-Control-Allow-Credentials')).toBe('true');
		});

		it('sets Access-Control-Allow-Methods', () => {
			const result = corsMiddleware(
				makeRequestInfo('OPTIONS', 'https://example.com/api/recipes/scrape', 'https://www.allrecipes.com'),
			) as Response;

			expect(result.headers.get('Access-Control-Allow-Methods')).toBe('POST, OPTIONS');
		});

		it('sets Access-Control-Allow-Headers', () => {
			const result = corsMiddleware(
				makeRequestInfo('OPTIONS', 'https://example.com/api/recipes/scrape', 'https://www.allrecipes.com'),
			) as Response;

			expect(result.headers.get('Access-Control-Allow-Headers')).toBe('Content-Type, Authorization');
		});
	});

	describe('passes through for non-matching requests', () => {
		it('passes through for OPTIONS on unlisted path', () => {
			const result = corsMiddleware(makeRequestInfo('OPTIONS', 'https://example.com/api/other', 'https://www.allrecipes.com'));

			expect(result).toBeUndefined();
		});

		it('passes through for POST on bookmarklet endpoint', () => {
			const result = corsMiddleware(
				makeRequestInfo('POST', 'https://example.com/api/recipes/scrape', 'https://www.allrecipes.com'),
			);

			expect(result).toBeUndefined();
		});

		it('passes through for GET requests', () => {
			const result = corsMiddleware(
				makeRequestInfo('GET', 'https://example.com/api/recipes/scrape', 'https://www.allrecipes.com'),
			);

			expect(result).toBeUndefined();
		});

		it('passes through for requests with no method match in allowedCorsPaths', () => {
			const result = corsMiddleware(
				makeRequestInfo('DELETE', 'https://example.com/api/recipes/scrape', 'https://www.allrecipes.com'),
			);

			expect(result).toBeUndefined();
		});
	});
});
