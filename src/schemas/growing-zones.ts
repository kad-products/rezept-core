import { z } from 'zod';
import { requiredString } from './utils';

const formSchema = z.object({
	id: z.string().uuid('Must be a valid UUID').optional(),
	code: requiredString('Code').regex(/^[a-z_]+$/, 'Must contain only lowercase letters and underscores'),
	name: requiredString('Name'),
});

export const growingZonesSchemas = {
	form: formSchema,
};
