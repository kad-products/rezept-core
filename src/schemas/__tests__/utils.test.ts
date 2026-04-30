import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { coercedInt, optionalString, optionalStringMax, optionalUuid, requiredString, requiredUuid } from '../utils';

describe('optionalString', () => {
	it('returns undefined for null', () => {
		expect(optionalString.parse(null)).toBeUndefined();
	});

	it('returns undefined for empty string', () => {
		expect(optionalString.parse('')).toBeUndefined();
	});

	it('returns undefined for whitespace-only string', () => {
		expect(optionalString.parse('   ')).toBeUndefined();
	});

	it('returns undefined for undefined', () => {
		expect(optionalString.parse(undefined)).toBeUndefined();
	});

	it('trims leading and trailing whitespace', () => {
		expect(optionalString.parse('  hello  ')).toBe('hello');
	});

	it('returns string as-is when no surrounding whitespace', () => {
		expect(optionalString.parse('hello')).toBe('hello');
	});
});

describe('optionalStringMax', () => {
	const schema = optionalStringMax(10, 'Name');

	it('returns undefined for null', () => {
		expect(schema.parse(null)).toBeUndefined();
	});

	it('returns undefined for empty string', () => {
		expect(schema.parse('')).toBeUndefined();
	});

	it('returns undefined for whitespace-only string', () => {
		expect(schema.parse('   ')).toBeUndefined();
	});

	it('trims and returns value within max length', () => {
		expect(schema.parse('  hello  ')).toBe('hello');
	});

	it('rejects strings exceeding max length', () => {
		const result = schema.safeParse('this is too long');
		expect(result.success).toBe(false);
	});

	it('includes field name and max in error message', () => {
		const result = schema.safeParse('this is too long');
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Name must be 10 characters or less');
		}
	});

	it('accepts string exactly at max length', () => {
		expect(schema.parse('1234567890')).toBe('1234567890');
	});
});

describe('optionalUuid', () => {
	it('returns undefined for null', () => {
		expect(optionalUuid.parse(null)).toBeUndefined();
	});

	it('returns undefined for empty string', () => {
		expect(optionalUuid.parse('')).toBeUndefined();
	});

	it('returns undefined for undefined', () => {
		expect(optionalUuid.parse(undefined)).toBeUndefined();
	});

	it('returns UUID for valid UUID string', () => {
		const id = randomUUID();
		expect(optionalUuid.parse(id)).toBe(id);
	});

	it('rejects invalid UUID', () => {
		expect(optionalUuid.safeParse('not-a-uuid').success).toBe(false);
	});
});

describe('requiredUuid', () => {
	it('accepts valid UUID', () => {
		const id = randomUUID();
		expect(requiredUuid.parse(id)).toBe(id);
	});

	it('rejects invalid UUID', () => {
		expect(requiredUuid.safeParse('not-a-uuid').success).toBe(false);
	});

	it('rejects empty string', () => {
		expect(requiredUuid.safeParse('').success).toBe(false);
	});
});

describe('coercedInt', () => {
	it('coerces a numeric string to integer', () => {
		expect(coercedInt().parse('5')).toBe(5);
	});

	it('rejects a float', () => {
		expect(coercedInt().safeParse(1.5).success).toBe(false);
	});

	it('enforces minimum value', () => {
		expect(coercedInt(0).safeParse(-1).success).toBe(false);
		expect(coercedInt(0).parse(0)).toBe(0);
	});

	it('enforces maximum value', () => {
		expect(coercedInt(1, 12).safeParse(13).success).toBe(false);
		expect(coercedInt(1, 12).parse(12)).toBe(12);
	});

	it('accepts value within min/max range', () => {
		expect(coercedInt(1, 12).parse(6)).toBe(6);
	});

	it('works with no bounds', () => {
		expect(coercedInt().parse(999)).toBe(999);
	});
});

describe('requiredString', () => {
	it('rejects empty string', () => {
		expect(requiredString('Name').safeParse('').success).toBe(false);
	});

	it('includes field name in required error message', () => {
		const result = requiredString('Name').safeParse('');
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Name is required');
		}
	});

	it('trims whitespace', () => {
		expect(requiredString('Name').parse('  hello  ')).toBe('hello');
	});

	it('rejects whitespace-only string', () => {
		expect(requiredString('Name').safeParse('   ').success).toBe(false);
	});

	it('accepts a valid string', () => {
		expect(requiredString('Name').parse('hello')).toBe('hello');
	});

	it('enforces max length when provided', () => {
		expect(requiredString('Name', 5).safeParse('toolong').success).toBe(false);
	});

	it('includes field name and max in length error message', () => {
		const result = requiredString('Name', 5).safeParse('toolong');
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].message).toBe('Name must be 5 characters or less');
		}
	});

	it('accepts string exactly at max length', () => {
		expect(requiredString('Name', 5).parse('hello')).toBe('hello');
	});
});
