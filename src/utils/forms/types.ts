export type FormValidationSingularResponse<T> = {
	errors?: Record<string, string[]>;
	data?: T;
};
