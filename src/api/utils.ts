import type { RzStepError } from '@/classes';

export function rzStepErrorToJsonResponse(err: unknown) {
	const stepError = err as RzStepError;
	return Response.json(
		{
			success: false,
			error: stepError.message,
		},
		{ status: stepError.code },
	);
}

export function errorResponse(error: string, status = 400): Response {
	return Response.json({ success: false, error }, { status });
}

export function successResponse<T>(data: T, status = 200): Response {
	return Response.json({ success: true, data }, { status });
}
