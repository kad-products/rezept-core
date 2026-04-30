import { env } from 'cloudflare:workers';
import { RzStepError } from '@/classes';

export function apiErrorResponse(err: unknown, prodErrorMessage?: string): Response {
	if (env.REZEPT_ENV === 'production') {
		return Response.json({ success: false, error: prodErrorMessage ?? 'An error occurred' }, { status: 500 });
	}

	if (err instanceof RzStepError) {
		return Response.json({ success: false, error: err.message }, { status: err.code });
	}
	const message = err instanceof Error ? err.message : 'An unexpected error occurred';
	return Response.json({ success: false, error: message }, { status: 500 });
}

export function errorResponse(error: string, status: number = 400): Response {
	return Response.json({ success: false, error }, { status });
}

export function successResponse<T>(data: T, status: number = 200): Response {
	return Response.json({ success: true, data }, { status });
}
