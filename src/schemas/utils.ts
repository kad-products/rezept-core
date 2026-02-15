import { z } from 'zod';

export const optionalString = z.preprocess(val => (val === '' ? undefined : val), z.string().optional());

export const optionalUuid = z.preprocess(
	val => (val === '' ? undefined : val),
	z.string().uuid('Must be a valid UUID').optional(),
);

export const requiredUuid = z.string().uuid('Must be a valid UUID');
