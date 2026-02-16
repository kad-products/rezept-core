import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createIngredientSchema, updateIngredientSchema } from '../ingredients';

describe('CreateIngredient form schema', () => {
	it('accepts valid ingredient with all fields', () => {
		const validData = {
			name: 'Tomatoes',
			description: 'Fresh red tomatoes',
			createdBy: randomUUID(),
		};

		const result = createIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid ingredient with minimal required fields', () => {
		const validData = {
			name: 'Garlic',
			createdBy: randomUUID(),
		};

		const result = createIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts various valid ingredient names', () => {
		const validNames = [
			'Salt',
			'Black Pepper',
			'Extra Virgin Olive Oil',
			'Chicken Breast',
			'All-Purpose Flour',
			'Granny Smith Apples',
			'Unsalted Butter',
		];

		validNames.forEach(name => {
			const validData = {
				name,
				createdBy: randomUUID(),
			};

			const result = createIngredientSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});

	it('trims whitespace from name', () => {
		const validData = {
			name: '  Basil  ',
			createdBy: randomUUID(),
		};

		const result = createIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Basil');
		}
	});

	it('trims whitespace from description', () => {
		const validData = {
			name: 'Oregano',
			description: '  Dried oregano leaves  ',
			createdBy: randomUUID(),
		};

		const result = createIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBe('Dried oregano leaves');
		}
	});

	it('converts empty string description to undefined', () => {
		const validData = {
			name: 'Thyme',
			description: '',
			createdBy: randomUUID(),
		};

		const result = createIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBeUndefined();
		}
	});

	it('rejects missing required fields', () => {
		const invalidData = {
			description: 'Test description',
		};

		const result = createIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('name');
			expect(paths).toContain('createdBy');
		}
	});

	it('rejects empty name', () => {
		const invalidData = {
			name: '',
			createdBy: randomUUID(),
		};

		const result = createIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('name');
		}
	});

	it('rejects empty name after trim', () => {
		const invalidData = {
			name: '   ',
			createdBy: randomUUID(),
		};

		const result = createIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('name');
		}
	});

	it('rejects name longer than 100 characters', () => {
		const invalidData = {
			name: 'a'.repeat(101),
			createdBy: randomUUID(),
		};

		const result = createIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('name');
		}
	});

	it('accepts name exactly 100 characters', () => {
		const validData = {
			name: 'a'.repeat(100),
			createdBy: randomUUID(),
		};

		const result = createIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects description longer than 500 characters', () => {
		const invalidData = {
			name: 'Test',
			description: 'a'.repeat(501),
			createdBy: randomUUID(),
		};

		const result = createIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('description');
		}
	});

	it('accepts description exactly 500 characters', () => {
		const validData = {
			name: 'Test',
			description: 'a'.repeat(500),
			createdBy: randomUUID(),
		};

		const result = createIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects invalid UUID format for createdBy', () => {
		const invalidData = {
			name: 'Test',
			createdBy: 'not-a-uuid',
		};

		const result = createIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('createdBy');
		}
	});
});

describe('UpdateIngredient form schema', () => {
	it('accepts valid update with all fields', () => {
		const validData = {
			id: randomUUID(),
			name: 'Updated Tomatoes',
			description: 'Updated description',
			updatedBy: randomUUID(),
		};

		const result = updateIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid update with minimal required fields', () => {
		const validData = {
			id: randomUUID(),
			name: 'Salt',
			updatedBy: randomUUID(),
		};

		const result = updateIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts update with deletedBy', () => {
		const validData = {
			id: randomUUID(),
			name: 'Deleted Ingredient',
			updatedBy: randomUUID(),
			deletedBy: randomUUID(),
		};

		const result = updateIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects update missing required id', () => {
		const invalidData = {
			name: 'Test',
			updatedBy: randomUUID(),
		};

		const result = updateIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});

	it('rejects update missing required updatedBy', () => {
		const invalidData = {
			id: randomUUID(),
			name: 'Test',
		};

		const result = updateIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('updatedBy');
		}
	});

	it('rejects invalid UUID format for id', () => {
		const invalidData = {
			id: 'bad-uuid',
			name: 'Test',
			updatedBy: randomUUID(),
		};

		const result = updateIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
		}
	});

	it('rejects invalid UUID format for updatedBy', () => {
		const invalidData = {
			id: randomUUID(),
			name: 'Test',
			updatedBy: 'invalid-uuid',
		};

		const result = updateIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('updatedBy');
		}
	});

	it('rejects invalid UUID format for deletedBy', () => {
		const invalidData = {
			id: randomUUID(),
			name: 'Test',
			updatedBy: randomUUID(),
			deletedBy: 'not-valid',
		};

		const result = updateIngredientSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('deletedBy');
		}
	});

	it('converts empty string deletedBy to undefined', () => {
		const validData = {
			id: randomUUID(),
			name: 'Test',
			updatedBy: randomUUID(),
			deletedBy: '',
		};

		const result = updateIngredientSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.deletedBy).toBeUndefined();
		}
	});

	it('applies same validation rules as create schema', () => {
		// Empty name
		const emptyName = {
			id: randomUUID(),
			name: '   ',
			updatedBy: randomUUID(),
		};
		expect(updateIngredientSchema.safeParse(emptyName).success).toBe(false);

		// Name too long
		const longName = {
			id: randomUUID(),
			name: 'a'.repeat(101),
			updatedBy: randomUUID(),
		};
		expect(updateIngredientSchema.safeParse(longName).success).toBe(false);

		// Description too long
		const longDescription = {
			id: randomUUID(),
			name: 'Test',
			description: 'a'.repeat(501),
			updatedBy: randomUUID(),
		};
		expect(updateIngredientSchema.safeParse(longDescription).success).toBe(false);

		// Valid with trim
		const withWhitespace = {
			id: randomUUID(),
			name: '  Trimmed Ingredient  ',
			description: '  Trimmed description  ',
			updatedBy: randomUUID(),
		};
		const result = updateIngredientSchema.safeParse(withWhitespace);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.name).toBe('Trimmed Ingredient');
			expect(result.data.description).toBe('Trimmed description');
		}
	});
});
