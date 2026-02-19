export type ActionState<T> = {
	success: boolean;
	errors?: Record<string, string[]>;
	data?: T;
};
