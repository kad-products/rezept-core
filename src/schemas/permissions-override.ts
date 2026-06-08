import { z } from 'zod';
import { permissionValues } from '@/data/permissions';

const formSchema = z.object({
	permissions: z.array(z.enum(permissionValues)).min(1, 'At least one permission is required'),
});

export const permissionsOverrideSchemas = {
	form: formSchema,
};
