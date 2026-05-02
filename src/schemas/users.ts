import { z } from 'zod';

const formSchema = z.object({
	id: z
		.union([z.string().uuid('Must be a valid UUID'), z.literal('')])
		.transform(val => (val === '' ? undefined : val))
		.optional(), // Present for update, absent for create
	username: z.string().trim().min(1, 'Username is required').max(50, 'Username must be 50 characters or less'),
});

export const usersSchemas = {
	form: formSchema,
};
