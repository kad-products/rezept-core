import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { createRecipeSchema, updateRecipeSchema } from '../recipes';

describe('CreateRecipe form schema', () => {
	it('accepts valid recipe with all fields', () => {
		const validData = {
			authorId: randomUUID(),
			title: 'Classic Spaghetti Carbonara',
			description: 'An authentic Italian pasta dish',
			source: "Grandmother's cookbook",
			servings: 4,
			prepTime: 10,
			cookTime: 15,
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts valid recipe with minimal required fields', () => {
		const validData = {
			authorId: randomUUID(),
			title: 'Simple Salad',
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('trims whitespace from title', () => {
		const validData = {
			authorId: randomUUID(),
			title: '  Chicken Soup  ',
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.title).toBe('Chicken Soup');
		}
	});

	it('trims whitespace from description and source', () => {
		const validData = {
			authorId: randomUUID(),
			title: 'Test',
			description: '  Test description  ',
			source: '  Test source  ',
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBe('Test description');
			expect(result.data.source).toBe('Test source');
		}
	});

	it('converts empty strings to undefined', () => {
		const validData = {
			authorId: randomUUID(),
			title: 'Test',
			description: '',
			source: '',
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.description).toBeUndefined();
			expect(result.data.source).toBeUndefined();
		}
	});

	it('coerces string numbers to integers', () => {
		const validData = {
			authorId: randomUUID(),
			title: 'Test',
			servings: '6' as any,
			prepTime: '20' as any,
			cookTime: '30' as any,
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(validData);
		expect(result.success).toBe(true);
		if (result.success) {
			expect(result.data.servings).toBe(6);
			expect(result.data.prepTime).toBe(20);
			expect(result.data.cookTime).toBe(30);
		}
	});

	it('accepts zero for prepTime and cookTime', () => {
		const validData = {
			authorId: randomUUID(),
			title: 'No-Cook Salad',
			prepTime: 0,
			cookTime: 0,
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects missing required fields', () => {
		const invalidData = {
			description: 'Test',
		};

		const result = createRecipeSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('authorId');
			expect(paths).toContain('title');
			expect(paths).toContain('createdBy');
		}
	});

	it('rejects empty title', () => {
		const invalidData = {
			authorId: randomUUID(),
			title: '   ',
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('title');
		}
	});

	it('rejects title longer than 200 characters', () => {
		const invalidData = {
			authorId: randomUUID(),
			title: 'a'.repeat(201),
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('title');
		}
	});

	it('rejects description longer than 1000 characters', () => {
		const invalidData = {
			authorId: randomUUID(),
			title: 'Test',
			description: 'a'.repeat(1001),
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('description');
		}
	});

	it('rejects source longer than 500 characters', () => {
		const invalidData = {
			authorId: randomUUID(),
			title: 'Test',
			source: 'a'.repeat(501),
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('source');
		}
	});

	it('rejects non-positive servings', () => {
		const invalidData = {
			authorId: randomUUID(),
			title: 'Test',
			servings: 0,
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('servings');
		}
	});

	it('rejects negative prepTime', () => {
		const invalidData = {
			authorId: randomUUID(),
			title: 'Test',
			prepTime: -5,
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('prepTime');
		}
	});

	it('rejects negative cookTime', () => {
		const invalidData = {
			authorId: randomUUID(),
			title: 'Test',
			cookTime: -10,
			createdBy: randomUUID(),
		};

		const result = createRecipeSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('cookTime');
		}
	});

	it('rejects invalid UUID formats', () => {
		const tests = [
			{ authorId: 'bad', title: 'Test', createdBy: randomUUID(), expectError: 'authorId' },
			{ authorId: randomUUID(), title: 'Test', createdBy: 'bad', expectError: 'createdBy' },
		];

		tests.forEach(test => {
			const result = createRecipeSchema.safeParse(test);
			expect(result.success).toBe(false);
			if (!result.success) {
				const paths = result.error.issues.map(i => i.path[0]);
				expect(paths).toContain(test.expectError);
			}
		});
	});
});

describe('UpdateRecipe form schema', () => {
	it('accepts valid update with all fields', () => {
		const validData = {
			id: randomUUID(),
			authorId: randomUUID(),
			title: 'Updated Recipe',
			description: 'Updated description',
			source: 'Updated source',
			servings: 6,
			prepTime: 25,
			cookTime: 45,
			updatedBy: randomUUID(),
		};

		const result = updateRecipeSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('accepts update with deletedBy', () => {
		const validData = {
			id: randomUUID(),
			authorId: randomUUID(),
			title: 'Test',
			updatedBy: randomUUID(),
			deletedBy: randomUUID(),
		};

		const result = updateRecipeSchema.safeParse(validData);
		expect(result.success).toBe(true);
	});

	it('rejects update missing required fields', () => {
		const invalidData = {
			title: 'Test',
		};

		const result = updateRecipeSchema.safeParse(invalidData);
		expect(result.success).toBe(false);
		if (!result.success) {
			const paths = result.error.issues.map(i => i.path[0]);
			expect(paths).toContain('id');
			expect(paths).toContain('authorId');
			expect(paths).toContain('updatedBy');
		}
	});

	it('applies same validation rules as create schema', () => {
		// Long title
		const longTitle = {
			id: randomUUID(),
			authorId: randomUUID(),
			title: 'a'.repeat(201),
			updatedBy: randomUUID(),
		};
		expect(updateRecipeSchema.safeParse(longTitle).success).toBe(false);

		// Negative servings
		const negativeServings = {
			id: randomUUID(),
			authorId: randomUUID(),
			title: 'Test',
			servings: -1,
			updatedBy: randomUUID(),
		};
		expect(updateRecipeSchema.safeParse(negativeServings).success).toBe(false);
	});
});
