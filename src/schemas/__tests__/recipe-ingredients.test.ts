import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createRecipeIngredientSchema, updateRecipeIngredientSchema } from '../recipe-ingredients';

describe('CreateRecipeIngredient form schema', () => {
	it('accepts valid ingredient with all fields', () => {
		const validData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			quantity: 2.5,
			unitId: randomUUID(),
			preparation: 'finely chopped',
			modifier: 'or substitute with red onion',
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid ingredient with minimal required fields', () => {
		const validData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			order: 0,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts ingredient without quantity (for "to taste")', () => {
		const validData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.quantity).toBeUndefined();
		}
	});

	it('accepts various valid quantities', () => {
		const quantities = [0.25, 0.5, 1, 2.5, 10, 100.99];

		quantities.forEach(quantity => {
			const validData = {
				recipeSectionId: randomUUID(),
				ingredientId: randomUUID(),
				quantity,
				order: 1,
				createdBy: randomUUID(),
			};

			const result = createRecipeIngredientSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('accepts various valid preparations', () => {
		const preparations = ['chopped', 'diced', 'minced', 'julienned', 'sliced thin', 'cut into 1-inch pieces'];

		preparations.forEach(preparation => {
			const validData = {
				recipeSectionId: randomUUID(),
				ingredientId: randomUUID(),
				preparation,
				order: 1,
				createdBy: randomUUID(),
			};

			const result = createRecipeIngredientSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('accepts various valid modifiers', () => {
		const modifiers = ['optional', 'or substitute with chicken', 'preferably organic', 'plus more for serving', 'divided'];

		modifiers.forEach(modifier => {
			const validData = {
				recipeSectionId: randomUUID(),
				ingredientId: randomUUID(),
				modifier,
				order: 1,
				createdBy: randomUUID(),
			};

			const result = createRecipeIngredientSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('accepts order starting at 0', () => {
		const validData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			order: 0,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('trims whitespace from preparation and modifier', () => {
		const validData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			preparation: '  diced  ',
			modifier: '  optional  ',
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.preparation).toBe('diced');
			expect(result.data.modifier).toBe('optional');
		}
	});

	it('converts empty strings to undefined', () => {
		const validData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			unitId: '',
			preparation: '',
			modifier: '',
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.unitId).toBeUndefined();
			expect(result.data.preparation).toBeUndefined();
			expect(result.data.modifier).toBeUndefined();
		}
	});

	it('coerces string quantity to number', () => {
		const validData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			quantity: '3.5' as any,
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.quantity).toBe(3.5);
			expect(typeof result.data.quantity).toBe('number');
		}
	});

	it('coerces string order to number', () => {
		const validData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			order: '2' as any,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.order).toBe(2);
			expect(typeof result.data.order).toBe('number');
		}
	});

	it('rejects missing required fields', () => {
		const invalidData = {
			quantity: 5,
		};

		const result = createRecipeIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('recipeSectionId');
			expect(paths).toContain('ingredientId');
			expect(paths).toContain('order');
			expect(paths).toContain('createdBy');
		}
	});

	it('rejects non-positive quantity', () => {
		const invalidData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			quantity: 0,
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('quantity');
		}
	});

	it('rejects negative quantity', () => {
		const invalidData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			quantity: -2.5,
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('quantity');
		}
	});

	it('rejects quantity with more than 2 decimal places', () => {
		const invalidData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			quantity: 1.255,
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('quantity');
		}
	});

	it('rejects preparation longer than 100 characters', () => {
		const invalidData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			preparation: 'a'.repeat(101),
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('preparation');
		}
	});

	it('rejects modifier longer than 100 characters', () => {
		const invalidData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			modifier: 'a'.repeat(101),
			order: 1,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('modifier');
		}
	});

	it('rejects negative order', () => {
		const invalidData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			order: -1,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('order');
		}
	});

	it('rejects decimal order', () => {
		const invalidData = {
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			order: 1.5,
			createdBy: randomUUID(),
		};

		const result = createRecipeIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('order');
		}
	});

	it('rejects invalid UUID formats', () => {
		const tests = [
			{ recipeSectionId: 'bad', ingredientId: randomUUID(), order: 1, createdBy: randomUUID(), expectError: 'recipeSectionId' },
			{ recipeSectionId: randomUUID(), ingredientId: 'bad', order: 1, createdBy: randomUUID(), expectError: 'ingredientId' },
			{
				recipeSectionId: randomUUID(),
				ingredientId: randomUUID(),
				unitId: 'bad',
				order: 1,
				createdBy: randomUUID(),
				expectError: 'unitId',
			},
			{ recipeSectionId: randomUUID(), ingredientId: randomUUID(), order: 1, createdBy: 'bad', expectError: 'createdBy' },
		];

		tests.forEach(test => {
			const result = createRecipeIngredientSchema.safeParse(test);
			expect(result.success).toBe(false);
			if (!result.success) {
				const paths = result.error.issues.map(i => i.path[0]);
				expect(paths).toContain(test.expectError);
			}
		});
	});
});

describe('UpdateRecipeIngredient form schema', () => {
	it('accepts valid update with all fields', () => {
		const validData = {
			id: randomUUID(),
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			quantity: 3,
			unitId: randomUUID(),
			preparation: 'chopped',
			modifier: 'optional',
			order: 2,
			updatedBy: randomUUID(),
		};

		const result = updateRecipeIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts update with deletedBy', () => {
		const validData = {
			id: randomUUID(),
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			order: 1,
			updatedBy: randomUUID(),
			deletedBy: randomUUID(),
		};

		const result = updateRecipeIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects update missing required fields', () => {
		const invalidData = {
			quantity: 5,
		};

		const result = updateRecipeIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
			expect(paths).toContain('recipeSectionId');
			expect(paths).toContain('ingredientId');
			expect(paths).toContain('order');
			expect(paths).toContain('updatedBy');
		}
	});

	it('applies same validation rules as create schema', () => {
		// Negative quantity
		const negativeQuantity = {
			id: randomUUID(),
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			quantity: -1,
			order: 1,
			updatedBy: randomUUID(),
		};
		expect(updateRecipeIngredientSchema.safeParse(negativeQuantity).success).toBe(false);

		// Too many decimals
		const tooManyDecimals = {
			id: randomUUID(),
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			quantity: 1.999,
			order: 1,
			updatedBy: randomUUID(),
		};
		expect(updateRecipeIngredientSchema.safeParse(tooManyDecimals).success).toBe(false);

		// Long preparation
		const longPreparation = {
			id: randomUUID(),
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			preparation: 'a'.repeat(101),
			order: 1,
			updatedBy: randomUUID(),
		};
		expect(updateRecipeIngredientSchema.safeParse(longPreparation).success).toBe(false);

		// Negative order
		const negativeOrder = {
			id: randomUUID(),
			recipeSectionId: randomUUID(),
			ingredientId: randomUUID(),
			order: -1,
			updatedBy: randomUUID(),
		};
		expect(updateRecipeIngredientSchema.safeParse(negativeOrder).success).toBe(false);
	});
});
