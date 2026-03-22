import type { RzStepError } from '@/types';

export default function rzStepErrorToJsonResponse(err: unknown) {
	const stepError = err as RzStepError;
	return Response.json(
		{
			success: false,
			errors: stepError.message,
		},
		{ status: stepError.code },
	);
}
