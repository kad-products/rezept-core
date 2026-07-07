import { randomUUID } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { recipesSchemas } from '../recipes';

describe('recipesSchemas.form', () => {
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

			const result = recipesSchemas.form.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts recipe with minimal required fields', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Simple Salad',
			};

			const result = recipesSchemas.form.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts recipe with id for updates', () => {
			const validData = {
				id: randomUUID(),
				authorId: randomUUID(),
				title: 'Updated Recipe',
			};

			const result = recipesSchemas.form.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('trims whitespace from text fields', () => {
			const validData = {
				authorId: randomUUID(),
				title: '  Chicken Soup  ',
				description: '  Test description  ',
				source: '  Test source  ',
			};

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(invalidData);
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

			const result = recipesSchemas.form.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('rejects title longer than 200 characters', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'a'.repeat(201),
			};

			const result = recipesSchemas.form.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('rejects description longer than 1000 characters', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				description: 'a'.repeat(1001),
			};

			const result = recipesSchemas.form.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('rejects negative times', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				prepTime: -5,
				cookTime: -10,
			};

			const result = recipesSchemas.form.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('coerces null numeric fields to undefined', () => {
			const data = {
				authorId: randomUUID(),
				title: 'Test',
				servings: null as any,
				prepTime: null as any,
				cookTime: null as any,
			};

			const result = recipesSchemas.form.safeParse(data);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.servings).toBeUndefined();
				expect(result.data.prepTime).toBeUndefined();
				expect(result.data.cookTime).toBeUndefined();
			}
		});

		it('coerces empty string numeric fields to undefined', () => {
			const data = {
				authorId: randomUUID(),
				title: 'Test',
				servings: '' as any,
				prepTime: '' as any,
				cookTime: '' as any,
			};

			const result = recipesSchemas.form.safeParse(data);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.servings).toBeUndefined();
				expect(result.data.prepTime).toBeUndefined();
				expect(result.data.cookTime).toBeUndefined();
			}
		});

		it('transforms empty string id to undefined', () => {
			const validData = {
				id: '',
				authorId: randomUUID(),
				title: 'Test',
			};

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(invalidData);
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

			const result = recipesSchemas.form.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe('cooking methods', () => {
		it('accepts a cooking method with instructions', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						cookingMethods: [
							{
								name: 'Standard',
								order: 1,
								instructions: [{ stepNumber: 1, instruction: 'Heat the oil in a large pan' }],
							},
						],
					},
				],
			};

			const result = recipesSchemas.form.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts a cooking method with id for updates', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						cookingMethods: [
							{
								id: randomUUID(),
								name: 'Standard',
								order: 1,
								instructions: [{ stepNumber: 1, instruction: 'Stir continuously' }],
							},
						],
					},
				],
			};

			const result = recipesSchemas.form.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts multiple cooking methods per section', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						cookingMethods: [
							{
								name: 'Stovetop',
								order: 1,
								instructions: [{ stepNumber: 1, instruction: 'Cook on the stove.' }],
							},
							{
								name: 'Oven',
								order: 2,
								instructions: [{ stepNumber: 1, instruction: 'Bake at 350°F.' }],
							},
						],
					},
				],
			};

			const result = recipesSchemas.form.safeParse(validData);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.sections?.[0].cookingMethods).toHaveLength(2);
			}
		});

		it('rejects empty cooking method name', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [{ order: 0, cookingMethods: [{ name: '   ', order: 1 }] }],
			};

			const result = recipesSchemas.form.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('rejects cooking method name longer than 100 characters', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [{ order: 0, cookingMethods: [{ name: 'a'.repeat(101), order: 1 }] }],
			};

			const result = recipesSchemas.form.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('accepts instruction with id for updates', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						cookingMethods: [
							{
								name: 'Standard',
								order: 1,
								instructions: [{ id: randomUUID(), stepNumber: 1, instruction: 'Stir continuously' }],
							},
						],
					},
				],
			};

			const result = recipesSchemas.form.safeParse(validData);
			expect(result.success).toBe(true);
		});

		it('accepts multiple instructions', () => {
			const validData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						cookingMethods: [
							{
								name: 'Standard',
								order: 1,
								instructions: [
									{ stepNumber: 1, instruction: 'First step' },
									{ stepNumber: 2, instruction: 'Second step' },
									{ stepNumber: 3, instruction: 'Third step' },
								],
							},
						],
					},
				],
			};

			const result = recipesSchemas.form.safeParse(validData);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.sections?.[0].cookingMethods?.[0].instructions).toHaveLength(3);
			}
		});

		it('rejects empty instruction', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						cookingMethods: [{ name: 'Standard', order: 1, instructions: [{ stepNumber: 1, instruction: '   ' }] }],
					},
				],
			};

			const result = recipesSchemas.form.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('rejects instruction longer than 2000 characters', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						cookingMethods: [{ name: 'Standard', order: 1, instructions: [{ stepNumber: 1, instruction: 'a'.repeat(2001) }] }],
					},
				],
			};

			const result = recipesSchemas.form.safeParse(invalidData);
			expect(result.success).toBe(false);
		});

		it('rejects step number less than 1', () => {
			const invalidData = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						cookingMethods: [{ name: 'Standard', order: 1, instructions: [{ stepNumber: 0, instruction: 'Test' }] }],
					},
				],
			};

			const result = recipesSchemas.form.safeParse(invalidData);
			expect(result.success).toBe(false);
		});
	});

	describe('complex recipes', () => {
		it('accepts complete recipe with multiple sections, ingredients, and cooking methods', () => {
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
						cookingMethods: [
							{
								name: 'Standard',
								order: 1,
								instructions: [
									{ stepNumber: 1, instruction: 'Heat the oil' },
									{ stepNumber: 2, instruction: 'Add ingredients' },
								],
							},
						],
					},
					{
						title: 'For the main dish',
						order: 1,
						ingredients: [{ ingredientId: randomUUID(), quantity: 500, unitId: randomUUID(), order: 0 }],
						cookingMethods: [
							{
								name: 'Standard',
								order: 1,
								instructions: [{ stepNumber: 1, instruction: 'Cook the main ingredient' }],
							},
						],
					},
				],
			};

			const result = recipesSchemas.form.safeParse(validData);
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.sections).toHaveLength(2);
				if (result?.data?.sections?.length === 2) {
					expect(result.data.sections[0].ingredients).toHaveLength(2);
					expect(result.data.sections[0].cookingMethods?.[0].instructions).toHaveLength(2);
					expect(result.data.sections[1].ingredients).toHaveLength(1);
					expect(result.data.sections[1].cookingMethods?.[0].instructions).toHaveLength(1);
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
						cookingMethods: [
							{
								id: randomUUID(),
								name: 'Standard',
								order: 1,
								instructions: [{ id: randomUUID(), stepNumber: 1, instruction: 'Updated step' }],
							},
						],
					},
				],
			};

			const result = recipesSchemas.form.safeParse(validData);
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

			const result = recipesSchemas.form.safeParse(recipeData);
			// expect(result).toBe({});
			expect(result.success).toBe(true);
			if (result.success) {
				expect(result.data.servings).toBeUndefined();
				expect(result.data.prepTime).toBeUndefined();
				expect(result.data.cookTime).toBeUndefined();
			}
		});
		it('should handle a scraped and transformed recipe', () => {
			const recipeData = {
				title: "Grandma's Corn Chowder",
				description:
					"Try grandma's corn chowder recipe for a creamy, delicious bowl of comforting soup made with creamed corn, potatoes, half-and-half, and bacon.",
				authorId: '2a137e54-6886-4116-afbe-fdd61c991c91',
				source: 'https://www.allrecipes.com/recipe/86096/grandmas-corn-chowder/',
				servings: 8,
				prepTime: 15,
				cookTime: 35,
				sections: [
					{
						order: 0,
						ingredients: [
							{ order: 1, raw: '0.5 cup diced bacon' },
							{ order: 2, raw: '4 medium potatoes, peeled and chopped' },
							{ order: 3, raw: '1 medium onion, chopped' },
							{ order: 4, raw: '3 cups cream-style corn' },
							{ order: 5, raw: '2 cups water' },
							{ order: 6, raw: '2 teaspoons salt' },
							{ order: 7, raw: 'ground black pepper to taste' },
							{ order: 8, raw: '2 cups half-and-half' },
						],
						instructions: [
							{ stepNumber: 1, instruction: 'Gather all ingredients.' },
							{
								stepNumber: 2,
								instruction:
									'Cook bacon in a large pot over medium-high heat until crisp, 5 to 7 minutes. Drain, leaving bacon and 2 tablespoons grease in the pot.',
							},
							{
								stepNumber: 3,
								instruction:
									'Add potatoes and onion to the pot; cook, stirring occasionally, for 5 minutes. Add corn, water, salt, and pepper; bring to a boil. Reduce the heat to low, cover the pot and simmer, stirring frequently, until potatoes are tender, about 20 minutes.',
							},
							{
								stepNumber: 4,
								instruction:
									'Warm half-and-half in a small saucepan until it bubbles; remove from the heat just before it boils. Mix into chowder.',
							},
							{ stepNumber: 5, instruction: 'Serve immediately.' },
						],
					},
				],
			};

			const result = recipesSchemas.form.safeParse(recipeData);
			expect(result.success).toBe(true);
		});
	});
});
