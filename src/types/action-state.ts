export type ActionState<T> = {
	success: boolean;
	code: number;
	errors?: Record<string, string[]>;
	data?: T;
};
