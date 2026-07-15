import { z } from 'zod';
import { coercedInt, optionalString, optionalStringMax, optionalUuid, requiredUuid } from './utils';

const formSchema = z.object({
	id: z.string().uuid('Must be a valid UUID').optional(),
	ingredientId: requiredUuid,
	growingZoneId: requiredUuid,
	startMonth: coercedInt(1, 12),
	endMonth: coercedInt(1, 12),
	notes: optionalStringMax(2000, 'Notes'),
});

export const ingredientSeasonsSchemas = {
	form: formSchema,
};
