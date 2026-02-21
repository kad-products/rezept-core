import { beforeEach, describe, expect, it, vi } from 'vitest';

// Mock repositories
vi.mock('@/repositories/recipes', () => ({
	createRecipe: vi.fn(),
	updateRecipe: vi.fn(),
}));

vi.mock('@/repositories/recipe-sections', () => ({
	updateRecipeSections: vi.fn(),
}));

vi.mock('@/repositories/recipe-ingredients', () => ({
	updateRecipeIngredients: vi.fn(),
}));

vi.mock('@/repositories/recipe-instructions', () => ({
	updateRecipeInstructions: vi.fn(),
}));

// Mock env
vi.mock('cloudflare:workers', () => ({
	env: { REZEPT_ENV: 'test' },
}));

interface MockRequestInfo {
	ctx: {
		user: { id: string } | null;
	};
}

// Mock rwsdk/worker
const mockRequestInfo: MockRequestInfo = {
	ctx: {
		user: {
			id: 'test-user-id',
		},
	},
};

vi.mock('rwsdk/worker', () => ({
	get requestInfo() {
		return mockRequestInfo;
	},
}));

import { randomUUID } from 'node:crypto';
import { updateRecipeIngredients } from '@/repositories/recipe-ingredients';
import { updateRecipeInstructions } from '@/repositories/recipe-instructions';
import { updateRecipeSections } from '@/repositories/recipe-sections';
import { createRecipe, updateRecipe } from '@/repositories/recipes';
import { saveRecipe } from '../recipes';

describe('saveRecipe', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx.user = { id: 'test-user-id' };

		// Set default mock returns
		vi.mocked(createRecipe).mockResolvedValue({
			id: 'mock-recipe-id',
			authorId: 'test-user-id',
			title: 'Test Recipe',
		} as any);

		vi.mocked(updateRecipe).mockResolvedValue({
			id: 'mock-recipe-id',
			authorId: 'test-user-id',
			title: 'Test Recipe',
		} as any);

		// Mock sections to return with IDs
		vi.mocked(updateRecipeSections).mockImplementation(async (recipeId, sections) => {
			return sections.map((s, i) => ({
				...s,
				id: s.id || `mock-section-${i}`,
				recipeId,
			})) as any;
		});

		// Mock ingredients/instructions to return with IDs
		vi.mocked(updateRecipeIngredients).mockImplementation(async (sectionId, ingredients) => {
			return ingredients.map((ing, i) => ({
				...ing,
				id: ing.id || `mock-ingredient-${i}`,
				recipeSectionId: sectionId,
			})) as any;
		});

		vi.mocked(updateRecipeInstructions).mockImplementation(async (sectionId, instructions) => {
			return instructions.map((inst, i) => ({
				...inst,
				id: inst.id || `mock-instruction-${i}`,
				recipeSectionId: sectionId,
			})) as any;
		});
	});

	describe('authentication', () => {
		it('rejects unauthenticated requests', async () => {
			mockRequestInfo.ctx.user = null;

			const data = {
				authorId: randomUUID(),
				title: 'Test Recipe',
				sections: [],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toContain('You must be logged in');
			expect(createRecipe).not.toHaveBeenCalled();
		});
	});

	describe('create recipe', () => {
		it('creates recipe with valid minimal data', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Simple Recipe',
				sections: [],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(true);
			expect(result.data?.id).toBe('mock-recipe-id');
			expect(createRecipe).toHaveBeenCalledTimes(1);
			expect(createRecipe).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Simple Recipe',
				}),
				'test-user-id',
			);
		});

		it('creates recipe with all optional fields', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Complete Recipe',
				description: 'A delicious dish',
				source: 'Family cookbook',
				servings: 4,
				prepTime: 15,
				cookTime: 30,
				sections: [],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(true);
			expect(createRecipe).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Complete Recipe',
					description: 'A delicious dish',
					source: 'Family cookbook',
					servings: 4,
					prepTime: 15,
					cookTime: 30,
				}),
				'test-user-id',
			);
		});

		it('validates required fields', async () => {
			const data = {} as any;

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(createRecipe).not.toHaveBeenCalled();
		});

		it('rejects empty title', async () => {
			const data = {
				authorId: randomUUID(),
				title: '   ',
				sections: [],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?.title).toBeDefined();
		});

		it('rejects title longer than 200 characters', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'a'.repeat(201),
				sections: [],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?.title).toBeDefined();
		});

		it('rejects negative prep or cook time', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Test',
				prepTime: -5,
				cookTime: -10,
				sections: [],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
		});

		it('handles repository errors gracefully', async () => {
			vi.mocked(createRecipe).mockRejectedValueOnce(new Error('Database error'));

			const data = {
				authorId: randomUUID(),
				title: 'Test Recipe',
				sections: [],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('returns saved recipe data with generated ID', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Test Recipe',
				sections: [],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
			expect(result.data?.id).toBe('mock-recipe-id');
			expect(result.data?.sections).toEqual([]);
		});
	});

	describe('create recipe with sections', () => {
		it('creates recipe and updates sections', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Recipe with Sections',
				sections: [
					{
						title: 'Main',
						order: 0,
						ingredients: [],
						instructions: [],
					},
					{
						title: 'Sauce',
						order: 1,
						ingredients: [],
						instructions: [],
					},
				],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(true);
			expect(createRecipe).toHaveBeenCalledTimes(1);
			expect(updateRecipeSections).toHaveBeenCalledTimes(1);
			expect(updateRecipeSections).toHaveBeenCalledWith(
				'mock-recipe-id',
				expect.arrayContaining([
					expect.objectContaining({ title: 'Main', order: 0 }),
					expect.objectContaining({ title: 'Sauce', order: 1 }),
				]),
				'test-user-id',
			);
		});

		it('returns saved sections with generated IDs', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Recipe with Sections',
				sections: [
					{
						title: 'Main',
						order: 0,
						ingredients: [],
						instructions: [],
					},
				],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(true);
			expect(result.data?.sections).toHaveLength(1);
			expect(result.data?.sections?.[0].id).toBe('mock-section-0');
			expect(result.data?.sections?.[0].title).toBe('Main');
		});

		it('creates recipe with sections, ingredients, and instructions', async () => {
			const ingredientId = randomUUID();
			const data = {
				authorId: randomUUID(),
				title: 'Complete Recipe',
				sections: [
					{
						title: 'Main',
						order: 0,
						ingredients: [
							{
								ingredientId,
								quantity: 2,
								unitId: randomUUID(),
								order: 0,
							},
						],
						instructions: [
							{
								stepNumber: 1,
								instruction: 'Mix ingredients',
							},
						],
					},
				],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(true);
			expect(createRecipe).toHaveBeenCalledTimes(1);
			expect(updateRecipeSections).toHaveBeenCalledTimes(1);
			expect(updateRecipeIngredients).toHaveBeenCalledTimes(1);
			expect(updateRecipeInstructions).toHaveBeenCalledTimes(1);

			// Verify returned data includes nested items
			expect(result.data?.sections?.[0].ingredients).toHaveLength(1);
			expect(result.data?.sections?.[0].instructions).toHaveLength(1);
		});

		it('validates section order', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						title: 'Main',
						order: -1, // Invalid
						ingredients: [],
						instructions: [],
					},
				],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
		});

		it('validates ingredient quantity', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						ingredients: [
							{
								ingredientId: randomUUID(),
								quantity: -1, // Invalid
								order: 0,
							},
						],
						instructions: [],
					},
				],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
		});

		it('validates instruction step number', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						ingredients: [],
						instructions: [
							{
								stepNumber: 0, // Must be >= 1
								instruction: 'Test',
							},
						],
					},
				],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
		});

		it('rejects empty instruction text', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						ingredients: [],
						instructions: [
							{
								stepNumber: 1,
								instruction: '   ',
							},
						],
					},
				],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
		});
	});

	describe('update recipe', () => {
		it('updates recipe with valid data', async () => {
			const recipeId = randomUUID();
			const data = {
				id: recipeId,
				authorId: randomUUID(),
				title: 'Updated Recipe',
				sections: [],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(true);
			expect(updateRecipe).toHaveBeenCalledTimes(1);
			expect(updateRecipe).toHaveBeenCalledWith(
				recipeId,
				expect.objectContaining({
					title: 'Updated Recipe',
				}),
				'test-user-id',
			);
		});

		it('handles update repository errors', async () => {
			vi.mocked(updateRecipe).mockRejectedValueOnce(new Error('Update failed'));

			const data = {
				id: randomUUID(),
				authorId: randomUUID(),
				title: 'Test',
				sections: [],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});
	});

	describe('error handling', () => {
		it('hides sensitive error details in production', async () => {
			vi.mocked(createRecipe).mockRejectedValueOnce(new Error('Connection failed: postgres://user:password@db.internal'));

			const data = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [],
			};

			const result = await saveRecipe(data);

			expect(result.errors?._form?.[0]).toBe('Failed to save item');
			expect(result.errors?._form?.[0]).not.toContain('postgres://');
			expect(result.errors?._form?.[0]).not.toContain('password');
		});

		it('handles section update errors', async () => {
			vi.mocked(updateRecipeSections).mockRejectedValueOnce(new Error('Section update failed'));

			const data = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						title: 'Main',
						order: 0,
						ingredients: [],
						instructions: [],
					},
				],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('handles ingredient update errors', async () => {
			vi.mocked(updateRecipeIngredients).mockRejectedValueOnce(new Error('Ingredient update failed'));

			const data = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						ingredients: [
							{
								ingredientId: randomUUID(),
								order: 0,
								quantity: 1,
							},
						],
						instructions: [],
					},
				],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('handles instruction update errors', async () => {
			vi.mocked(updateRecipeInstructions).mockRejectedValueOnce(new Error('Instruction update failed'));

			const data = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						ingredients: [],
						instructions: [
							{
								stepNumber: 1,
								instruction: 'Test step',
							},
						],
					},
				],
			};

			const result = await saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});
	});
});
