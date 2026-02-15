export type ActionState<T = undefined> = {
	success: boolean;
	errors?: Record<string, string[]>;
	data?: T;
};
