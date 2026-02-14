// src/schemas/__tests__/user.test.ts
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createUserSchema, updateUserSchema } from '../users';

describe('CreateUser form schema', () => {
	it('accepts valid user with username', () => {
		const validData = {
			username: 'johndoe',
		};

		const result = createUserSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts username with various valid characters', () => {
		const validUsernames = ['user123', 'john_doe', 'jane-smith', 'user.name', 'CamelCase', 'lowercase', 'UPPERCASE'];

		validUsernames.forEach(username => {
			const validData = { username };
			const result = createUserSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('trims whitespace from username', () => {
		const validData = {
			username: '  johndoe  ',
		};

		const result = createUserSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.username).toBe('johndoe');
		}
	});

	it('rejects missing username', () => {
		const invalidData = {};

		const result = createUserSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('username');
		}
	});

	it('rejects empty username', () => {
		const invalidData = {
			username: '',
		};

		const result = createUserSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('username');
		}
	});

	it('rejects empty username after trim', () => {
		const invalidData = {
			username: '   ',
		};

		const result = createUserSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('username');
		}
	});

	it('rejects username longer than 50 characters', () => {
		const invalidData = {
			username: 'a'.repeat(51),
		};

		const result = createUserSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('username');
		}
	});

	it('accepts username exactly 50 characters', () => {
		const validData = {
			username: 'a'.repeat(50),
		};

		const result = createUserSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts single character username', () => {
		const validData = {
			username: 'a',
		};

		const result = createUserSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});
});

describe('UpdateUser form schema', () => {
	it('accepts valid update with username', () => {
		const validData = {
			id: randomUUID(),
			username: 'updated_username',
		};

		const result = updateUserSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects update missing required id', () => {
		const invalidData = {
			username: 'johndoe',
		};

		const result = updateUserSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});

	it('rejects update missing required username', () => {
		const invalidData = {
			id: randomUUID(),
		};

		const result = updateUserSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('username');
		}
	});

	it('rejects invalid UUID format for id', () => {
		const invalidData = {
			id: 'not-a-uuid',
			username: 'johndoe',
		};

		const result = updateUserSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});

	it('applies same validation rules as create schema', () => {
		// Empty username
		const emptyUsername = {
			id: randomUUID(),
			username: '   ',
		};
		expect(updateUserSchema.safeParse(emptyUsername).success).toBe(false);

		// Too long username
		const longUsername = {
			id: randomUUID(),
			username: 'a'.repeat(51),
		};
		expect(updateUserSchema.safeParse(longUsername).success).toBe(false);

		// Valid with trim
		const withWhitespace = {
			id: randomUUID(),
			username: '  validuser  ',
		};
		const result = updateUserSchema.safeParse(withWhitespace);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.username).toBe('validuser');
		}
	});
});
