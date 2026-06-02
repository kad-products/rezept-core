import { env } from 'cloudflare:workers';

export function getWebAuthnConfig(request: Request): { rpName: string; rpID: string; origin: string } {
	const rpID = new URL(request.url).hostname;
	const rpName = import.meta.env.VITE_IS_DEV_SERVER ? 'Development App' : env.WEBAUTHN_APP_NAME;

	const url = new URL(request.url);
	// Cloudflare (production) and tunnel (dev) both terminate TLS before the Worker.
	// wrangler dev reports http:// in req.url even when the tunnel provides HTTPS,
	// so force https for any non-localhost host to match what the browser actually sees.
	const origin = url.hostname === 'localhost' || url.hostname === '127.0.0.1' ? url.origin : `https://${url.host}`;

	return {
		rpName,
		rpID,
		origin,
	};
}
