import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { usersSchemas } from '../users';

describe('usersSchemas.form', () => {
	describe('create (no id)', () => {
		it('accepts valid username', () => {
			const result = usersSchemas.form.safeParse({ username: 'johndoe' });
			expect(result.success).toBe(true);
		});

		it('trims whitespace from username', () => {
			const result = usersSchemas.form.safeParse({ username: '  johndoe  ' });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.username).toBe('johndoe');
			}
		});

		it('accepts username with various valid characters', () => {
			const usernames = ['user123', 'john_doe', 'jane-smith', 'user.name', 'CamelCase', 'lowercase', 'UPPERCASE'];
			for (const username of usernames) {
				expect(usersSchemas.form.safeParse({ username }).success).toBe(true);
			}
		});

		it('accepts username exactly 50 characters', () => {
			expect(usersSchemas.form.safeParse({ username: 'a'.repeat(50) }).success).toBe(true);
		});

		it('accepts single character username', () => {
			expect(usersSchemas.form.safeParse({ username: 'a' }).success).toBe(true);
		});

		it('rejects missing username', () => {
			const result = usersSchemas.form.safeParse({});
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('username');
			}
		});

		it('rejects empty username', () => {
			const result = usersSchemas.form.safeParse({ username: '' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('username');
			}
		});

		it('rejects whitespace-only username after trim', () => {
			const result = usersSchemas.form.safeParse({ username: '   ' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('username');
			}
		});

		it('rejects username longer than 50 characters', () => {
			const result = usersSchemas.form.safeParse({ username: 'a'.repeat(51) });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('username');
			}
		});
	});

	describe('update (with id)', () => {
		it('accepts valid UUID id with username', () => {
			const result = usersSchemas.form.safeParse({ id: randomUUID(), username: 'updated_username' });
			expect(result.success).toBe(true);
		});

		it('rejects invalid UUID format for id', () => {
			const result = usersSchemas.form.safeParse({ id: 'not-a-uuid', username: 'johndoe' });
			expect(result.success).toBe(false);
			if (!result.success) {
				expect(result.error.issues.map(i => i.path[0])).toContain('id');
			}
		});

		it('transforms empty string id to undefined', () => {
			const result = usersSchemas.form.safeParse({ id: '', username: 'johndoe' });
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.id).toBeUndefined();
			}
		});

		it('applies username validation rules regardless of whether id is present', () => {
			const id = randomUUID();

			const emptyAfterTrim = usersSchemas.form.safeParse({ id, username: '   ' });
			expect(emptyAfterTrim.success).toBe(false);

			const tooLong = usersSchemas.form.safeParse({ id, username: 'a'.repeat(51) });
			expect(tooLong.success).toBe(false);

			const withWhitespace = usersSchemas.form.safeParse({ id, username: '  validuser  ' });
			expect(withWhitespace.success).toBe(true);
			if (withWhitespace.success) {
				expect(withWhitespace.data.username).toBe('validuser');
			}
		});
	});
});
