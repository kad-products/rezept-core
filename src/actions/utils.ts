import { env } from 'cloudflare:workers';
import type { ActionState } from '@/types';

export function errorResponse<T>(
	errors: string | Record<string, string[]> | unknown,
	status = 400,
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

export function successResponse<T>(data: T, status = 200): ActionState<T> {
	return {
		success: true,
		code: status,
		data,
	};
}
