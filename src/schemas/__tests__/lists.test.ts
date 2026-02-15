// src/schemas/__tests__/list.test.ts
import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createListSchema, updateListSchema } from '../lists';

describe('CreateList form schema', () => {
	it('accepts valid list with all fields', () => {
		const validData = {
			userId: randomUUID(),
			name: 'Weekly Grocery List',
			createdBy: randomUUID(),
		};

		const result = createListSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts various valid list names', () => {
		const validNames = ['Groceries', 'Thanksgiving Shopping', 'Weekly Meal Prep', 'Party Supplies 2024', 'Farmers Market Run'];

		validNames.forEach(name => {
			const validData = {
				userId: randomUUID(),
				name,
				createdBy: randomUUID(),
			};

			const result = createListSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('trims whitespace from name', () => {
		const validData = {
			userId: randomUUID(),
			name: '  Shopping List  ',
			createdBy: randomUUID(),
		};

		const result = createListSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Shopping List');
		}
	});

	it('rejects missing required fields', () => {
		const invalidData = {
			name: 'Test List',
		};

		const result = createListSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('userId');
			expect(paths).toContain('createdBy');
		}
	});

	it('rejects empty name', () => {
		const invalidData = {
			userId: randomUUID(),
			name: '',
			createdBy: randomUUID(),
		};

		const result = createListSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('name');
		}
	});

	it('rejects empty name after trim', () => {
		const invalidData = {
			userId: randomUUID(),
			name: '   ',
			createdBy: randomUUID(),
		};

		const result = createListSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('name');
		}
	});

	it('rejects name longer than 200 characters', () => {
		const invalidData = {
			userId: randomUUID(),
			name: 'a'.repeat(201),
			createdBy: randomUUID(),
		};

		const result = createListSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('name');
		}
	});

	it('accepts name exactly 200 characters', () => {
		const validData = {
			userId: randomUUID(),
			name: 'a'.repeat(200),
			createdBy: randomUUID(),
		};

		const result = createListSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts single character name', () => {
		const validData = {
			userId: randomUUID(),
			name: 'X',
			createdBy: randomUUID(),
		};

		const result = createListSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects invalid UUID format for userId', () => {
		const invalidData = {
			userId: 'not-a-uuid',
			name: 'Test List',
			createdBy: randomUUID(),
		};

		const result = createListSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('userId');
		}
	});

	it('rejects invalid UUID format for createdBy', () => {
		const invalidData = {
			userId: randomUUID(),
			name: 'Test List',
			createdBy: 'bad-uuid',
		};

		const result = createListSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('createdBy');
		}
	});
});

describe('UpdateList form schema', () => {
	it('accepts valid update with all fields', () => {
		const validData = {
			id: randomUUID(),
			userId: randomUUID(),
			name: 'Updated List Name',
			updatedBy: randomUUID(),
		};

		const result = updateListSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid update with minimal required fields', () => {
		const validData = {
			id: randomUUID(),
			userId: randomUUID(),
			name: 'Minimal',
			updatedBy: randomUUID(),
		};

		const result = updateListSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts update with deletedBy', () => {
		const validData = {
			id: randomUUID(),
			userId: randomUUID(),
			name: 'Deleted List',
			updatedBy: randomUUID(),
			deletedBy: randomUUID(),
		};

		const result = updateListSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects update missing required id', () => {
		const invalidData = {
			userId: randomUUID(),
			name: 'Test',
			updatedBy: randomUUID(),
		};

		const result = updateListSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});

	it('rejects update missing required updatedBy', () => {
		const invalidData = {
			id: randomUUID(),
			userId: randomUUID(),
			name: 'Test',
		};

		const result = updateListSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('updatedBy');
		}
	});

	it('rejects invalid UUID format for id', () => {
		const invalidData = {
			id: 'not-valid',
			userId: randomUUID(),
			name: 'Test',
			updatedBy: randomUUID(),
		};

		const result = updateListSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});

	it('rejects invalid UUID format for updatedBy', () => {
		const invalidData = {
			id: randomUUID(),
			userId: randomUUID(),
			name: 'Test',
			updatedBy: 'invalid-uuid',
		};

		const result = updateListSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('updatedBy');
		}
	});

	it('rejects invalid UUID format for deletedBy', () => {
		const invalidData = {
			id: randomUUID(),
			userId: randomUUID(),
			name: 'Test',
			updatedBy: randomUUID(),
			deletedBy: 'bad-uuid',
		};

		const result = updateListSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('deletedBy');
		}
	});

	it('converts empty string deletedBy to undefined', () => {
		const validData = {
			id: randomUUID(),
			userId: randomUUID(),
			name: 'Test',
			updatedBy: randomUUID(),
			deletedBy: '',
		};

		const result = updateListSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.deletedBy).toBeUndefined();
		}
	});

	it('applies same validation rules as create schema', () => {
		// Empty name
		const emptyName = {
			id: randomUUID(),
			userId: randomUUID(),
			name: '   ',
			updatedBy: randomUUID(),
		};
		expect(updateListSchema.safeParse(emptyName).success).toBe(false);

		// Name too long
		const longName = {
			id: randomUUID(),
			userId: randomUUID(),
			name: 'a'.repeat(201),
			updatedBy: randomUUID(),
		};
		expect(updateListSchema.safeParse(longName).success).toBe(false);

		// Valid with trim
		const withWhitespace = {
			id: randomUUID(),
			userId: randomUUID(),
			name: '  Trimmed Name  ',
			updatedBy: randomUUID(),
		};
		const result = updateListSchema.safeParse(withWhitespace);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Trimmed Name');
		}
	});
});
