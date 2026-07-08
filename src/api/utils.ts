import { env } from 'cloudflare:workers';
import { RzAccessError, RzStepError } from '@/classes';

export function apiErrorResponse(err: unknown, fallbackMessage: string = 'An error occurred'): Response {
	if (err instanceof RzAccessError) {
		return Response.json({ success: false, error: err.message }, { status: err.code });
	}
	if (err instanceof RzStepError) {
		return Response.json(
			{
				success: false,
				error: env.REZEPT_ENV !== 'production' ? err.devMessage : err.publicMessage,
				...(env.REZEPT_ENV !== 'production' && err.cause !== undefined ? { cause: err.cause } : {}),
			},
			{ status: err.code },
		);
	}

	const status = 500;
	if (env.REZEPT_ENV === 'production') {
		return Response.json({ success: false, error: fallbackMessage }, { status });
	}
	const message = err instanceof Error ? err.message : 'An unexpected error occurred';
	return Response.json({ success: false, error: message }, { status });
}

export function errorResponse(error: string, status: number = 400): Response {
	return Response.json({ success: false, error }, { status });
}

export function successResponse<T>(data: T, status: number = 200): Response {
	return Response.json({ success: true, data }, { status });
}
