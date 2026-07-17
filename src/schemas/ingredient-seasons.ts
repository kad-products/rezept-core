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

const loadRecordSchema = z.object({
	id: optionalUuid,
	ingredientId: optionalUuid,
	ingredientName: optionalString,
	startMonth: coercedInt(1, 12).optional(),
	endMonth: coercedInt(1, 12).optional(),
	verified: z.boolean().optional(),
	notes: optionalStringMax(2000, 'Notes'),
});

export const ingredientSeasonsSchemas = {
	form: formSchema,
	loadRecord: loadRecordSchema,
};
