import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { recipeFormSchema } from '../recipes';

describe('recipeFormSchema', () => {
	describe('basic recipe fields', () => {
		it('accepts valid recipe with all fields', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Classic Spaghetti Carbonara',
				description: 'An authentic Italian pasta dish',
				source: "Grandmother's cookbook",
				servings: 4,
				prepTime: 10,
				cookTime: 15,
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts recipe with minimal required fields', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Simple Salad',
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts recipe with id for updates', () => {
			const validData = {
				id: randomUUID(),
				authorId: randomUUID(),
				title: 'Updated Recipe',
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('trims whitespace from text fields', () => {
			const validData = {
				authorId: randomUUID(),
				title: '  Chicken Soup  ',
				description: '  Test description  ',
				source: '  Test source  ',
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.title).toBe('Chicken Soup');
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
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.description).toBeUndefined();
				expect(result.data.source).toBeUndefined();
			}
		});

		it('coerces numeric strings to numbers', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				servings: '6' as any,
				prepTime: '20' as any,
				cookTime: '30' as any,
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.servings).toBe(6);
				expect(result.data.prepTime).toBe(20);
				expect(result.data.cookTime).toBe(30);
			}
		});

		it('rejects missing required fields', () => {
			const invalidData = {
				description: 'Test',
			};

			const result = recipeFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
			if (!result.success) {
				const paths = result.error.issues.map(i => i.path[0]);
				expect(paths).toContain('authorId');
				expect(paths).toContain('title');
			}
		});

		it('rejects empty title', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: '   ',
			};

			const result = recipeFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('rejects title longer than 200 characters', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'a'.repeat(201),
			};

			const result = recipeFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('rejects description longer than 1000 characters', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				description: 'a'.repeat(1001),
			};

			const result = recipeFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('rejects negative times', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				prepTime: -5,
				cookTime: -10,
			};

			const result = recipeFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('transforms empty string id to undefined', () => {
			const validData = {
				id: '',
				authorId: randomUUID(),
				title: 'Test',
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.id).toBeUndefined();
			}
		});
	});

	describe('sections', () => {
		it('accepts empty sections array', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts section with all fields', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test Recipe',
				sections: [
					{
						title: 'Main',
						order: 0,
					},
				],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts section with id for updates', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						id: randomUUID(),
						title: 'Updated Section',
						order: 0,
					},
				],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts multiple sections', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{ title: 'For the sauce', order: 0 },
					{ title: 'For the pasta', order: 1 },
					{ title: 'For serving', order: 2 },
				],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.sections).toHaveLength(3);
			}
		});
	});

	describe('ingredients', () => {
		it('accepts ingredient with all fields', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						title: 'Main',
						order: 0,
						ingredients: [
							{
								ingredientId: randomUUID(),
								quantity: 2.5,
								unitId: randomUUID(),
								preparation: 'diced',
								modifier: 'fresh',
								order: 0,
							},
						],
					},
				],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts ingredient with minimal fields', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						ingredients: [
							{
								ingredientId: randomUUID(),
								order: 0,
							},
						],
					},
				],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts ingredient with id for updates', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						ingredients: [
							{
								id: randomUUID(),
								ingredientId: randomUUID(),
								order: 0,
							},
						],
					},
				],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts multiple ingredients', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						ingredients: [
							{ ingredientId: randomUUID(), order: 0 },
							{ ingredientId: randomUUID(), order: 1 },
							{ ingredientId: randomUUID(), order: 2 },
						],
					},
				],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result?.data?.sections?.length).toBe(1);
				if (result?.data?.sections?.length === 1) {
					expect(result.data.sections[0].ingredients).toHaveLength(3);
				}
			}
		});

		it('accepts fractional quantities', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						ingredients: [
							{
								ingredientId: randomUUID(),
								quantity: 0.25,
								order: 0,
							},
						],
					},
				],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('rejects negative quantities', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						ingredients: [
							{
								ingredientId: randomUUID(),
								quantity: -1,
								order: 0,
							},
						],
					},
				],
			};

			const result = recipeFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('rejects preparation longer than 100 characters', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						ingredients: [
							{
								ingredientId: randomUUID(),
								preparation: 'a'.repeat(101),
								order: 0,
							},
						],
					},
				],
			};

			const result = recipeFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe('instructions', () => {
		it('accepts instruction with all fields', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						instructions: [
							{
								stepNumber: 1,
								instruction: 'Heat the oil in a large pan',
							},
						],
					},
				],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts instruction with id for updates', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						instructions: [
							{
								id: randomUUID(),
								stepNumber: 1,
								instruction: 'Stir continuously',
							},
						],
					},
				],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts multiple instructions', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						instructions: [
							{ stepNumber: 1, instruction: 'First step' },
							{ stepNumber: 2, instruction: 'Second step' },
							{ stepNumber: 3, instruction: 'Third step' },
						],
					},
				],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result?.data?.sections?.length).toBe(1);
				if (result?.data?.sections?.length === 1) {
					expect(result.data.sections[0].instructions).toHaveLength(3);
				}
			}
		});

		it('rejects empty instruction', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						instructions: [
							{
								stepNumber: 1,
								instruction: '   ',
							},
						],
					},
				],
			};

			const result = recipeFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('rejects instruction longer than 2000 characters', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						instructions: [
							{
								stepNumber: 1,
								instruction: 'a'.repeat(2001),
							},
						],
					},
				],
			};

			const result = recipeFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('rejects step number less than 1', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						instructions: [
							{
								stepNumber: 0,
								instruction: 'Test',
							},
						],
					},
				],
			};

			const result = recipeFormSchema.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe('complex recipes', () => {
		it('accepts complete recipe with multiple sections, ingredients, and instructions', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Complete Recipe',
				description: 'A complex multi-section recipe',
				servings: 4,
				prepTime: 30,
				cookTime: 60,
				sections: [
					{
						title: 'For the sauce',
						order: 0,
						ingredients: [
							{ ingredientId: randomUUID(), quantity: 2, unitId: randomUUID(), order: 0 },
							{ ingredientId: randomUUID(), quantity: 1, order: 1 },
						],
						instructions: [
							{ stepNumber: 1, instruction: 'Heat the oil' },
							{ stepNumber: 2, instruction: 'Add ingredients' },
						],
					},
					{
						title: 'For the main dish',
						order: 1,
						ingredients: [{ ingredientId: randomUUID(), quantity: 500, unitId: randomUUID(), order: 0 }],
						instructions: [{ stepNumber: 1, instruction: 'Cook the main ingredient' }],
					},
				],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.sections).toHaveLength(2);
				if (result?.data?.sections?.length === 2) {
					expect(result.data.sections[0].ingredients).toHaveLength(2);
					expect(result.data.sections[0].instructions).toHaveLength(2);
					expect(result.data.sections[1].ingredients).toHaveLength(1);
					expect(result.data.sections[1].instructions).toHaveLength(1);
				}
			}
		});

		it('accepts recipe being updated with existing IDs', () => {
			const validData = {
				id: randomUUID(),
				authorId: randomUUID(),
				title: 'Updated Recipe',
				sections: [
					{
						id: randomUUID(),
						title: 'Updated Section',
						order: 0,
						ingredients: [{ id: randomUUID(), ingredientId: randomUUID(), order: 0 }],
						instructions: [{ id: randomUUID(), stepNumber: 1, instruction: 'Updated step' }],
					},
				],
			};

			const result = recipeFormSchema.safeParse(validData);
			expect(result.success).toBe(true);
		});
	});
	describe('Real test scenarios', () => {
		it('should handle no servings or source on a recently saved recipe', () => {
			const recipeData = {
				id: '7d7c0c68-fe8a-437e-b9a3-6a2b3c0a348b',
				authorId: '2a137e54-6886-4116-afbe-fdd61c991c91',
				title: 'ASDF',
				description: null,
				source: null,
				servings: null,
				prepTime: null,
				cookTime: null,
				createdAt: '2026-02-21T04:27:44.637Z',
				createdBy: '2a137e54-6886-4116-afbe-fdd61c991c91',
				updatedAt: null,
				updatedBy: null,
				deletedAt: null,
				deletedBy: null,
				sections: [],
			};

			const result = recipeFormSchema.safeParse(recipeData);
			// expect(result).toBe({});
			expect(result.success).toBe(true);
		});
	});
});
