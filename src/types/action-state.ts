export type ActionState<T = undefined> = {
	success: boolean | undefined;
	errors?: Record<string, string[]>;
	data?: T;
};
