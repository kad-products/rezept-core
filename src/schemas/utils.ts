import { z } from 'zod';

export const optionalString = z
	.union([z.string(), z.null()])
	.transform(val => val?.trim() || undefined)
	.optional();

export const optionalStringMax = (max: number, field: string) =>
	optionalString.pipe(z.string().max(max, `${field} must be ${max} characters or less`).optional());

export const optionalUuid = z
	.union([z.string().uuid('Must be a valid UUID'), z.null(), z.literal('')])
	.transform(val => (val === '' || val === null ? undefined : val))
	.optional();

export const requiredUuid = z.string().uuid('Must be a valid UUID');

export const coercedInt = (min?: number, max?: number): z.ZodNumber => {
	let schema = z.coerce.number().int();
	if (min !== undefined) schema = schema.min(min);
	if (max !== undefined) schema = schema.max(max);
	return schema as z.ZodNumber;
};

// Handles null and empty string from form inputs before coercing — z.coerce.number() turns both into 0 without this
export const optionalCoercedInt = (min?: number, max?: number) => {
	const inner = coercedInt(min, max);
	return z
		.union([z.null().transform((): undefined => undefined), z.literal('').transform((): undefined => undefined), inner])
		.optional();
};

export const requiredString = (field: string, max?: number): z.ZodString => {
	const base = z.string().trim().min(1, `${field} is required`);
	return max !== undefined ? base.max(max, `${field} must be ${max} characters or less`) : base;
};
