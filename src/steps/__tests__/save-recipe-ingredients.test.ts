import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RzStepError } from '@/classes';
import Logger from '@/logger';
import { saveRecipeIngredients } from '@/steps';
import type { RecipeIngredientDBRead, RecipeSectionIngredientsInput } from '@/types';

vi.mock('@/repositories', () => ({
	updateRecipeIngredients: vi.fn(),
}));

import { updateRecipeIngredients } from '@/repositories';

const logger = new Logger();
const recipeId = 'recipe-123';
const userId = '00000000-0000-0000-0000-000000000001';
const sectionId = 'section-456';
const mockIngredients = [
	{ id: 'ing-1', recipeSectionId: sectionId, raw: 'flour', order: 0 },
] as unknown as RecipeIngredientDBRead[];

describe('saveRecipeIngredients', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('saves ingredients for a single section and keys the result by sectionId', async () => {
		vi.mocked(updateRecipeIngredients).mockResolvedValue(mockIngredients);
		const ingredientsData: RecipeSectionIngredientsInput[] = [{ sectionId, ingredients: [] }];

		const result = await saveRecipeIngredients(recipeId, ingredientsData, userId, logger);

		expect(updateRecipeIngredients).toHaveBeenCalledWith(sectionId, [], userId, logger);
		expect(result).toEqual({ [sectionId]: mockIngredients });
	});

	it('saves ingredients for multiple sections', async () => {
		const sectionId2 = 'section-789';
		vi.mocked(updateRecipeIngredients).mockResolvedValue(mockIngredients);
		const ingredientsData: RecipeSectionIngredientsInput[] = [
			{ sectionId, ingredients: [] },
			{ sectionId: sectionId2, ingredients: [] },
		];

		const result = await saveRecipeIngredients(recipeId, ingredientsData, userId, logger);

		expect(updateRecipeIngredients).toHaveBeenCalledTimes(2);
		expect(result).toHaveProperty(sectionId);
		expect(result).toHaveProperty(sectionId2);
	});

	it('throws RzStepError 400 when updateRecipeIngredients fails', async () => {
		vi.mocked(updateRecipeIngredients).mockRejectedValue(new Error('DB connection error'));
		const ingredientsData: RecipeSectionIngredientsInput[] = [{ sectionId, ingredients: [] }];

		await expect(saveRecipeIngredients(recipeId, ingredientsData, userId, logger)).rejects.toThrow(RzStepError);
		await expect(saveRecipeIngredients(recipeId, ingredientsData, userId, logger)).rejects.toMatchObject({ code: 400 });
	});
});
