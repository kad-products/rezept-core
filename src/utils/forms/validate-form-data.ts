import type { ZodType } from 'zod';
import type { FormValidationResponse } from './types';

export function validateFormData<T>(
	inputData: unknown,
	validationSchema: ZodType<T>,
	errorKeyPrefix: string = '',
): FormValidationResponse<T> {
	console.log(`Validation input: ${JSON.stringify(inputData, null, 4)}`);

	const parsed = validationSchema.safeParse(inputData);

	if (!parsed.success) {
		const errors = parsed.error.flatten().fieldErrors;
		const mappedErrors: Record<string, string[]> = {};
		console.log(`Errors: ${JSON.stringify(errors, null, 4)}`);
		if (errors) {
			for (const [key, value] of Object.entries(errors)) {
				if (!value) {
					continue;
				}
				mappedErrors[`${errorKeyPrefix}${key}`] = Array.isArray(value) ? value : [value];
			}
		}
		return {
			errors: mappedErrors,
		};
	}

	return parsed;
}
