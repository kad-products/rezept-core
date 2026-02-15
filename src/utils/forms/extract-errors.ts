import type { FormValidationResponse } from '@/types';

export function extractErrors<T>(
	zodValidationResults: FormValidationResponse<T> | FormValidationResponse<T>[],
): Record<string, string[]> | undefined {
	zodValidationResults = Array.isArray(zodValidationResults) ? zodValidationResults : [zodValidationResults];

	if (zodValidationResults.some(r => r.errors)) {
		return zodValidationResults.reduce(
			(allErrors, result) => {
				if (result.errors) {
					Object.entries(result.errors).forEach(pair => {
						allErrors[pair[0]] = pair[1];
					});
				}
				return allErrors;
			},
			{} as Record<string, string[]>,
		);
	}

	return undefined;
}
