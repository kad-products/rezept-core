import { env } from 'cloudflare:workers';
import type { ActionState } from '@/types';

export function errorResponse<T>(
	errors: string | Record<string, string[]> | unknown,
	status: number = 400,
	prodErrorMessage?: string,
): ActionState<T> {
	if (env.REZEPT_ENV === 'production') {
		return { success: false, code: status, errors: { _form: [prodErrorMessage ?? 'An error occurred'] } };
	}

	// Field-level errors from Zod validation — pass through directly
	if (typeof errors === 'object' && errors !== null && !(errors instanceof Error)) {
		return { success: false, code: status, errors: errors as Record<string, string[]> };
	}

	const message = errors instanceof Error ? errors.message : String(errors);
	return { success: false, code: status, errors: { _form: [message] } };
}

export function successResponse<T>(data: T, status: number = 200): ActionState<T> {
	return {
		success: true,
		code: status,
		data,
	};
}

export function getWebAuthnConfig(request: Request): { rpName: string; rpID: string; origin: string } {
	const rpID = new URL(request.url).hostname;
	const rpName = import.meta.env.VITE_IS_DEV_SERVER ? 'Development App' : env.WEBAUTHN_APP_NAME;

	const url = new URL(request.url);
	// Cloudflare (production) and tunnel (dev) both terminate TLS before the Worker.
	// wrangler dev reports http:// in req.url even when the tunnel provides HTTPS,
	// so force https for any non-localhost host to match what the browser actually sees.
	const origin = url.hostname.includes('localhost') || url.hostname === '127.0.0.1' ? url.origin : `https://${url.host}`;

	return {
		rpName,
		rpID,
		origin,
	};
}
