import { beforeEach, describe, expect, it, vi } from 'vitest';
import type RzLogger from '@/logger';
import Logger from '@/logger';

const mockEnv = vi.hoisted(() => ({ REZEPT_ENV: 'development' as string }));
const capturedChain = vi.hoisted(() => ({ handlers: [] as unknown[] }));

// Mock steps
vi.mock('@/steps', () => ({
	saveRecipe: vi.fn(),
	saveRecipeSections: vi.fn(),
	saveRecipeIngredients: vi.fn(),
	saveRecipeInstructions: vi.fn(),
}));

// Mock env
vi.mock('cloudflare:workers', () => ({
	env: mockEnv,
}));

interface MockRequestInfo {
	ctx: {
		user: { id: string } | null;
		logger: RzLogger;
	};
}

// Mock rwsdk/worker
const mockRequestInfo: MockRequestInfo = {
	ctx: {
		user: {
			id: 'test-user-id',
		},
		logger: new Logger(),
	},
};

vi.mock('rwsdk/worker', () => ({
	serverAction: (handlers: unknown[]) => {
		capturedChain.handlers = handlers;
		return Array.isArray(handlers) ? handlers[handlers.length - 1] : handlers;
	},
	get requestInfo() {
		return mockRequestInfo;
	},
}));

import { randomUUID } from 'node:crypto';
import { RzStepError } from '@/classes';
import { requireAuthentication } from '@/interrupters';
import { saveRecipe, saveRecipeIngredients, saveRecipeInstructions, saveRecipeSections } from '@/steps';
import { _saveRecipe } from '../recipes';

describe('_saveRecipe', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockRequestInfo.ctx.user = { id: 'test-user-id' };
		mockEnv.REZEPT_ENV = 'development';

		vi.mocked(saveRecipe).mockResolvedValue({
			id: 'mock-recipe-id',
			authorId: 'test-user-id',
			title: 'Test Recipe',
		} as any);

		vi.mocked(saveRecipeSections).mockImplementation(async (recipeId, sections) => {
			return (sections as any[]).map((s, i) => ({
				...s,
				id: s.id || `mock-section-${i}`,
				recipeId,
			})) as any;
		});

		vi.mocked(saveRecipeInstructions).mockImplementation(async (_recipeId, instructionsData) => {
			const result: Record<string, any[]> = {};
			for (const { sectionId, instructions } of instructionsData) {
				result[sectionId] = (instructions as any[]).map((inst, i) => ({
					...inst,
					id: inst.id || `mock-instruction-${i}`,
					recipeSectionId: sectionId,
				}));
			}
			return result;
		});

		vi.mocked(saveRecipeIngredients).mockImplementation(async (_recipeId, ingredientsData) => {
			const result: Record<string, any[]> = {};
			for (const { sectionId, ingredients } of ingredientsData) {
				result[sectionId] = (ingredients as any[]).map((ing, i) => ({
					...ing,
					id: ing.id || `mock-ingredient-${i}`,
					recipeSectionId: sectionId,
				}));
			}
			return result;
		});
	});

	describe('authentication', () => {
		it('includes requireAuthentication in the serverAction chain', () => {
			expect(capturedChain.handlers).toContain(requireAuthentication);
		});
	});

	describe('create recipe', () => {
		it('creates recipe with valid minimal data', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Simple Recipe',
				sections: [],
			};

			const result = await _saveRecipe(data);

			expect(result.success).toBe(true);
			expect(result.data?.id).toBe('mock-recipe-id');
			expect(saveRecipe).toHaveBeenCalledTimes(1);
			expect(saveRecipe).toHaveBeenCalledWith(
				expect.objectContaining({ title: 'Simple Recipe' }),
				'test-user-id',
				expect.anything(),
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

			const result = await _saveRecipe(data);

			expect(result.success).toBe(true);
			expect(saveRecipe).toHaveBeenCalledWith(
				expect.objectContaining({
					title: 'Complete Recipe',
					description: 'A delicious dish',
					source: 'Family cookbook',
					servings: 4,
					prepTime: 15,
					cookTime: 30,
				}),
				'test-user-id',
				expect.anything(),
			);
		});

		it('validates required fields', async () => {
			const data = {} as any;

			const result = await _saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors).toBeDefined();
			expect(saveRecipe).not.toHaveBeenCalled();
		});

		it('rejects empty title', async () => {
			const data = {
				authorId: randomUUID(),
				title: '   ',
				sections: [],
			};

			const result = await _saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?.title).toBeDefined();
		});

		it('rejects title longer than 200 characters', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'a'.repeat(201),
				sections: [],
			};

			const result = await _saveRecipe(data);

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

			const result = await _saveRecipe(data);

			expect(result.success).toBe(false);
		});

		it('handles save errors gracefully', async () => {
			vi.mocked(saveRecipe).mockRejectedValueOnce(new RzStepError(400, 'Failed to save recipe', 'Database error'));

			const data = {
				authorId: randomUUID(),
				title: 'Test Recipe',
				sections: [],
			};

			const result = await _saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('returns saved recipe data with generated ID', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Test Recipe',
				sections: [],
			};

			const result = await _saveRecipe(data);

			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
			expect(result.data?.id).toBe('mock-recipe-id');
			expect(result.data?.sections).toEqual([]);
		});
	});

	describe('create recipe with sections', () => {
		it('creates recipe and saves sections', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Recipe with Sections',
				sections: [
					{ title: 'Main', order: 0, ingredients: [], instructions: [] },
					{ title: 'Sauce', order: 1, ingredients: [], instructions: [] },
				],
			};

			const result = await _saveRecipe(data);

			expect(result.success).toBe(true);
			expect(saveRecipe).toHaveBeenCalledTimes(1);
			expect(saveRecipeSections).toHaveBeenCalledTimes(1);
			expect(saveRecipeSections).toHaveBeenCalledWith(
				'mock-recipe-id',
				expect.arrayContaining([
					expect.objectContaining({ title: 'Main', order: 0 }),
					expect.objectContaining({ title: 'Sauce', order: 1 }),
				]),
				'test-user-id',
				expect.anything(),
			);
		});

		it('returns saved sections with generated IDs', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Recipe with Sections',
				sections: [{ title: 'Main', order: 0, ingredients: [], instructions: [] }],
			};

			const result = await _saveRecipe(data);

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
						ingredients: [{ ingredientId, quantity: 2, unitId: randomUUID(), order: 0 }],
						instructions: [{ stepNumber: 1, instruction: 'Mix ingredients' }],
					},
				],
			};

			const result = await _saveRecipe(data);

			expect(result.success).toBe(true);
			expect(saveRecipe).toHaveBeenCalledTimes(1);
			expect(saveRecipeSections).toHaveBeenCalledTimes(1);
			expect(saveRecipeInstructions).toHaveBeenCalledTimes(1);
			expect(saveRecipeIngredients).toHaveBeenCalledTimes(1);
			expect(result.data?.sections?.[0].ingredients).toHaveLength(1);
			expect(result.data?.sections?.[0].instructions).toHaveLength(1);
		});

		it('validates section order', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [{ order: -1, ingredients: [], instructions: [] }],
			};

			const result = await _saveRecipe(data);

			expect(result.success).toBe(false);
		});

		it('validates ingredient quantity', async () => {
			const data = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						title: 'Main',
						order: 0,
						ingredients: [{ ingredientId: randomUUID(), quantity: -1, order: 0 }],
						instructions: [],
					},
				],
			};

			const result = await _saveRecipe(data);

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
						instructions: [{ stepNumber: 0, instruction: 'Test' }],
					},
				],
			};

			const result = await _saveRecipe(data);

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
						instructions: [{ stepNumber: 1, instruction: '   ' }],
					},
				],
			};

			const result = await _saveRecipe(data);

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

			const result = await _saveRecipe(data);

			expect(result.success).toBe(true);
			expect(saveRecipe).toHaveBeenCalledTimes(1);
			expect(saveRecipe).toHaveBeenCalledWith(
				expect.objectContaining({ id: recipeId, title: 'Updated Recipe' }),
				'test-user-id',
				expect.anything(),
			);
		});

		it('handles update errors', async () => {
			vi.mocked(saveRecipe).mockRejectedValueOnce(new RzStepError(400, 'Failed to save recipe', 'Update failed'));

			const data = {
				id: randomUUID(),
				authorId: randomUUID(),
				title: 'Test',
				sections: [],
			};

			const result = await _saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});
	});

	describe('error handling', () => {
		it('hides sensitive error details in production', async () => {
			vi.mocked(saveRecipe).mockRejectedValueOnce(
				new RzStepError(
					400,
					'Failed to save recipe',
					'Error saving recipe: Connection failed: postgres://user:password@db.internal',
				),
			);
			mockEnv.REZEPT_ENV = 'production';

			const data = { authorId: randomUUID(), title: 'Test', sections: [] };

			const result = await _saveRecipe(data);

			expect(result.errors?._form?.[0]).toBe('Failed to save recipe');
			expect(result.errors?._form?.[0]).not.toContain('postgres://');
			expect(result.errors?._form?.[0]).not.toContain('password');
		});

		it('handles section save errors', async () => {
			vi.mocked(saveRecipeSections).mockRejectedValueOnce(
				new RzStepError(400, 'Failed to save recipe sections', 'Section save failed'),
			);

			const data = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [{ title: 'Main', order: 0, ingredients: [], instructions: [] }],
			};

			const result = await _saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('handles ingredient save errors', async () => {
			vi.mocked(saveRecipeIngredients).mockRejectedValueOnce(
				new RzStepError(400, 'Failed to save recipe ingredients', 'Ingredient save failed'),
			);

			const data = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						ingredients: [{ ingredientId: randomUUID(), order: 0, quantity: 1 }],
						instructions: [],
					},
				],
			};

			const result = await _saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});

		it('returns 500 for non-step errors', async () => {
			vi.mocked(saveRecipe).mockRejectedValueOnce(new Error('Unexpected failure'));
			const result = await _saveRecipe({ authorId: randomUUID(), title: 'Test', sections: [] });
			expect(result.success).toBe(false);
			expect(result.code).toBe(500);
			expect(result.errors?._form?.[0]).toContain('Unexpected failure');
		});

		it('handles instruction save errors', async () => {
			vi.mocked(saveRecipeInstructions).mockRejectedValueOnce(
				new RzStepError(400, 'Failed to save recipe instructions', 'Instruction save failed'),
			);

			const data = {
				authorId: randomUUID(),
				title: 'Test',
				sections: [
					{
						order: 0,
						ingredients: [],
						instructions: [{ stepNumber: 1, instruction: 'Test step' }],
					},
				],
			};

			const result = await _saveRecipe(data);

			expect(result.success).toBe(false);
			expect(result.errors?._form).toBeDefined();
		});
	});
});
