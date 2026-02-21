import { z } from 'zod';

// export const optionalString = z.preprocess(val => (val === '' ? undefined : val), z.string().optional());

// export const optionalUuid = z.preprocess(
// 	val => (val === '' ? undefined : val),
// 	z.string().uuid('Must be a valid UUID').optional(),
// );

export const optionalString = z
	.union([z.string(), z.null()])
	.transform(val => (val === '' ? undefined : val))
	.optional();

export const optionalUuid = z
	.union([z.string().uuid('Must be a valid UUID'), z.null(), z.literal('')])
	.transform(val => (val === '' ? undefined : val))
	.optional();

export const requiredUuid = z.string().uuid('Must be a valid UUID');
