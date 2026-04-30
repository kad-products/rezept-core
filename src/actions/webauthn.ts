import { env } from 'cloudflare:workers';

export function getWebAuthnConfig(request: Request): { rpName: string; rpID: string; origin: string } {
	const rpID = new URL(request.url).hostname;
	const rpName = import.meta.env.VITE_IS_DEV_SERVER ? 'Development App' : env.WEBAUTHN_APP_NAME;

	// origin handling that works with cloudflare tunnels for local development
	const url = new URL(import.meta.env.VITE_BASE_URL);
	const origin = url.origin;

	return {
		rpName,
		rpID,
		origin,
	};
}
