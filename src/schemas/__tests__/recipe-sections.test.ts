import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createRecipeSectionSchema, updateRecipeSectionSchema } from '../recipe-sections';

describe('CreateRecipeSection form schema', () => {
	it('accepts valid section with all fields', () => {
		const validData = {
			recipeId: randomUUID(),
			title: 'For the Sauce',
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeSectionSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid section without title (simple recipes)', () => {
		const validData = {
			recipeId: randomUUID(),
			order: 0,
			createdBy: randomUUID(),
		};

		const result = createRecipeSectionSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts various valid section titles', () => {
		const validTitles = ['For the Dough', 'Filling', 'Assembly', 'Garnish', 'Marinade', 'Toppings'];

		validTitles.forEach(title => {
			const validData = {
				recipeId: randomUUID(),
				title,
				order: 1,
				createdBy: randomUUID(),
			};

			const result = createRecipeSectionSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('accepts order starting at 0', () => {
		const validData = {
			recipeId: randomUUID(),
			order: 0,
			createdBy: randomUUID(),
		};

		const result = createRecipeSectionSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts various order values', () => {
		const orders = [0, 1, 5, 10, 100];

		orders.forEach(order => {
			const validData = {
				recipeId: randomUUID(),
				order,
				createdBy: randomUUID(),
			};

			const result = createRecipeSectionSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('trims whitespace from title', () => {
		const validData = {
			recipeId: randomUUID(),
			title: '  For the Topping  ',
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeSectionSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.title).toBe('For the Topping');
		}
	});

	it('converts empty string title to undefined', () => {
		const validData = {
			recipeId: randomUUID(),
			title: '',
			order: 0,
			createdBy: randomUUID(),
		};

		const result = createRecipeSectionSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.title).toBeUndefined();
		}
	});

	it('coerces string order to number', () => {
		const validData = {
			recipeId: randomUUID(),
			order: '3' as any,
			createdBy: randomUUID(),
		};

		const result = createRecipeSectionSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.order).toBe(3);
			expect(typeof result.data.order).toBe('number');
		}
	});

	it('rejects missing required fields', () => {
		const invalidData = {
			title: 'Test',
		};

		const result = createRecipeSectionSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('recipeId');
			expect(paths).toContain('order');
			expect(paths).toContain('createdBy');
		}
	});

	it('rejects title longer than 200 characters', () => {
		const invalidData = {
			recipeId: randomUUID(),
			title: 'a'.repeat(201),
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeSectionSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('title');
		}
	});

	it('accepts title exactly 200 characters', () => {
		const validData = {
			recipeId: randomUUID(),
			title: 'a'.repeat(200),
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeSectionSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects negative order', () => {
		const invalidData = {
			recipeId: randomUUID(),
			order: -1,
			createdBy: randomUUID(),
		};

		const result = createRecipeSectionSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('order');
		}
	});

	it('rejects decimal order', () => {
		const invalidData = {
			recipeId: randomUUID(),
			order: 1.5,
			createdBy: randomUUID(),
		};

		const result = createRecipeSectionSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('order');
		}
	});

	it('rejects invalid UUID formats', () => {
		const tests = [
			{ recipeId: 'bad', order: 1, createdBy: randomUUID(), expectError: 'recipeId' },
			{ recipeId: randomUUID(), order: 1, createdBy: 'bad', expectError: 'createdBy' },
		];

		tests.forEach(test => {
			const result = createRecipeSectionSchema.safeParse(test);
			expect(result.success).toBe(false);
			if (!result.success) {
				const paths = result.error.issues.map(i => i.path[0]);
				expect(paths).toContain(test.expectError);
			}
		});
	});
});

describe('UpdateRecipeSection form schema', () => {
	it('accepts valid update with all fields', () => {
		const validData = {
			id: randomUUID(),
			recipeId: randomUUID(),
			title: 'Updated Section',
			order: 2,
			updatedBy: randomUUID(),
		};

		const result = updateRecipeSectionSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts update with deletedBy', () => {
		const validData = {
			id: randomUUID(),
			recipeId: randomUUID(),
			order: 1,
			updatedBy: randomUUID(),
			deletedBy: randomUUID(),
		};

		const result = updateRecipeSectionSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects update missing required fields', () => {
		const invalidData = {
			title: 'Test',
		};

		const result = updateRecipeSectionSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
			expect(paths).toContain('recipeId');
			expect(paths).toContain('order');
			expect(paths).toContain('updatedBy');
		}
	});

	it('applies same validation rules as create schema', () => {
		// Long title
		const longTitle = {
			id: randomUUID(),
			recipeId: randomUUID(),
			title: 'a'.repeat(201),
			order: 1,
			updatedBy: randomUUID(),
		};
		expect(updateRecipeSectionSchema.safeParse(longTitle).success).toBe(false);

		// Negative order
		const negativeOrder = {
			id: randomUUID(),
			recipeId: randomUUID(),
			order: -1,
			updatedBy: randomUUID(),
		};
		expect(updateRecipeSectionSchema.safeParse(negativeOrder).success).toBe(false);

		// Decimal order
		const decimalOrder = {
			id: randomUUID(),
			recipeId: randomUUID(),
			order: 2.5,
			updatedBy: randomUUID(),
		};
		expect(updateRecipeSectionSchema.safeParse(decimalOrder).success).toBe(false);
	});
});
