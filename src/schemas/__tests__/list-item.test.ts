import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createListItemSchema, updateListItemSchema } from '../';

describe('CreateListItem form schema', () => {
	it('accepts valid list item with all fields', () => {
		const validData = {
			listId: randomUUID(),
			ingredientId: randomUUID(),
			quantity: 5.25,
			status: 'NEEDED' as const,
			unitId: randomUUID(),
			createdBy: randomUUID(),
		};

		const result = createListItemSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid list item with minimal required fields', () => {
		const validData = {
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			createdBy: randomUUID(),
		};

		const result = createListItemSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts all valid status values', () => {
		const statuses = ['NEEDED', 'PURCHASED', 'SKIPPED'] as const;

		statuses.forEach(status => {
			const validData = {
				listId: randomUUID(),
				ingredientId: randomUUID(),
				status,
				createdBy: randomUUID(),
			};

			const result = createListItemSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('accepts quantity with up to 2 decimal places', () => {
		const quantities = [1, 1.5, 2.25, 0.01, 100.99];

		quantities.forEach(quantity => {
			const validData = {
				listId: randomUUID(),
				ingredientId: randomUUID(),
				status: 'NEEDED' as const,
				quantity,
				createdBy: randomUUID(),
			};

			const result = createListItemSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('converts empty string unitId to undefined', () => {
		const validData = {
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			unitId: '',
			createdBy: randomUUID(),
		};

		const result = createListItemSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.unitId).toBeUndefined();
		}
	});

	it('rejects missing required fields', () => {
		const invalidData = {
			quantity: 5,
			status: 'NEEDED' as const,
		};

		const result = createListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('ingredientId');
			expect(paths).toContain('listId');
			expect(paths).toContain('createdBy');
		}
	});

	it('rejects invalid UUID format for listId', () => {
		const invalidData = {
			listId: 'not-a-uuid',
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			createdBy: randomUUID(),
		};

		const result = createListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('listId');
		}
	});

	it('rejects invalid UUID format for ingredientId', () => {
		const invalidData = {
			listId: randomUUID(),
			ingredientId: '12345',
			status: 'NEEDED' as const,
			createdBy: randomUUID(),
		};

		const result = createListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('ingredientId');
		}
	});

	it('rejects invalid UUID format for unitId', () => {
		const invalidData = {
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			unitId: 'invalid-uuid',
			createdBy: randomUUID(),
		};

		const result = createListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('unitId');
		}
	});

	it('rejects invalid UUID format for createdBy', () => {
		const invalidData = {
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			createdBy: 'bad-uuid',
		};

		const result = createListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('createdBy');
		}
	});

	it('rejects invalid status value', () => {
		const invalidData = {
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'INVALID_STATUS',
			createdBy: randomUUID(),
		};

		const result = createListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('status');
		}
	});

	it('rejects negative quantity', () => {
		const invalidData = {
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			quantity: -5,
			createdBy: randomUUID(),
		};

		const result = createListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('quantity');
		}
	});

	it('rejects zero quantity', () => {
		const invalidData = {
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			quantity: 0,
			createdBy: randomUUID(),
		};

		const result = createListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('quantity');
		}
	});

	it('rejects quantity with more than 2 decimal places', () => {
		const invalidData = {
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			quantity: 1.255,
			createdBy: randomUUID(),
		};

		const result = createListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('quantity');
		}
	});

	it('coerces string quantity to number', () => {
		const validData = {
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			quantity: '5.5' as any,
			createdBy: randomUUID(),
		};

		const result = createListItemSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.quantity).toBe(5.5);
			expect(typeof result.data.quantity).toBe('number');
		}
	});
});

describe('UpdateListItem form schema', () => {
	it('accepts valid update with all fields', () => {
		const validData = {
			id: randomUUID(),
			listId: randomUUID(),
			ingredientId: randomUUID(),
			quantity: 3.5,
			status: 'PURCHASED' as const,
			unitId: randomUUID(),
			updatedBy: randomUUID(),
		};

		const result = updateListItemSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid update with minimal required fields', () => {
		const validData = {
			id: randomUUID(),
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'SKIPPED' as const,
			updatedBy: randomUUID(),
		};

		const result = updateListItemSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts update with deletedBy', () => {
		const validData = {
			id: randomUUID(),
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			updatedBy: randomUUID(),
			deletedBy: randomUUID(),
		};

		const result = updateListItemSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects update missing required id', () => {
		const invalidData = {
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			updatedBy: randomUUID(),
		};

		const result = updateListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});

	it('rejects update missing required updatedBy', () => {
		const invalidData = {
			id: randomUUID(),
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
		};

		const result = updateListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('updatedBy');
		}
	});

	it('rejects invalid UUID format for id', () => {
		const invalidData = {
			id: 'not-a-uuid',
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			updatedBy: randomUUID(),
		};

		const result = updateListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});

	it('rejects invalid UUID format for updatedBy', () => {
		const invalidData = {
			id: randomUUID(),
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			updatedBy: 'bad-uuid',
		};

		const result = updateListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('updatedBy');
		}
	});

	it('rejects invalid UUID format for deletedBy', () => {
		const invalidData = {
			id: randomUUID(),
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			updatedBy: randomUUID(),
			deletedBy: 'invalid',
		};

		const result = updateListItemSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('deletedBy');
		}
	});

	it('converts empty string deletedBy to undefined', () => {
		const validData = {
			id: randomUUID(),
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			updatedBy: randomUUID(),
			deletedBy: '',
		};

		const result = updateListItemSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.deletedBy).toBeUndefined();
		}
	});

	it('applies same validation rules as create schema', () => {
		// Negative quantity
		const invalidQuantity = {
			id: randomUUID(),
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			quantity: -1,
			updatedBy: randomUUID(),
		};

		expect(updateListItemSchema.safeParse(invalidQuantity).success).toBe(false);

		// Invalid status
		const invalidStatus = {
			id: randomUUID(),
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'WRONG',
			updatedBy: randomUUID(),
		};

		expect(updateListItemSchema.safeParse(invalidStatus).success).toBe(false);

		// Too many decimals
		const invalidDecimals = {
			id: randomUUID(),
			listId: randomUUID(),
			ingredientId: randomUUID(),
			status: 'NEEDED' as const,
			quantity: 1.999,
			updatedBy: randomUUID(),
		};

		expect(updateListItemSchema.safeParse(invalidDecimals).success).toBe(false);
	});
});
