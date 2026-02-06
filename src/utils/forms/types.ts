export type FormValidationResponse<T> = {
	errors?: Record<string, string[]>;
	data?: T;
};
