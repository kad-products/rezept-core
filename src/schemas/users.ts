import { z } from 'zod';
import { userRoles } from '@/data/roles';

const usernameField = z.string().trim().min(1, 'Username is required').max(50, 'Username must be 50 characters or less');

const formSchema = z.object({
	id: z
		.union([z.string().uuid('Must be a valid UUID'), z.literal('')])
		.transform(val => (val === '' ? undefined : val))
		.optional(), // Present for update, absent for create
	username: usernameField,
});

const adminEditSchema = z.object({
	id: z.string().uuid('Must be a valid UUID'),
	username: usernameField,
	role: z.enum(userRoles),
});

export const usersSchemas = {
	form: formSchema,
	adminEdit: adminEditSchema,
};
