import { SELF } from 'cloudflare:test';
import { describe, expect, it } from 'vitest';

/**
 * Regression baseline for issue #127 — page UX for auth failures.
 *
 * When an unauthenticated user hits a protected page route, requireAuthentication
 * throws RzAccessError(401), which bubbles up to handlePageError. Because the
 * request is a page navigation (no __rsc_action_id param), handlePageError renders
 * RootErrorHandler inside the normal Document shell.
 *
 * Current behaviour: 200 HTML — the app renders an error component in the page.
 * This is better than crashing the worker (pre-#73 fix) and better than returning
 * a JSON blob to a browser navigation, but the UX is not finalised yet.
 *
 * When #127 is resolved (redirect vs interstitial decision), update these assertions
 * to match the agreed behaviour.
 */
describe('page auth failure (issue #127)', () => {
	it('unauthenticated GET to a protected page returns HTML — not a redirect, not JSON', async () => {
		const response = await SELF.fetch('https://example.com/profile');

		// Current behaviour: full-page HTML response, status 200
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toMatch(/text\/html/);
		expect(response.headers.get('location')).toBeNull();

		const body = await response.text();
		expect(body).toMatch(/<!DOCTYPE html>/i);
	});
});
