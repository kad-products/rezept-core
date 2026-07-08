import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RzStepError } from '@/classes';
import { createNoopLogger } from '@/logger';
import { saveRecipeCookingMethods } from '@/steps';
import type { RecipeCookingMethodDBRead, RecipeSectionCookingMethodsInput } from '@/types';

vi.mock('@/repositories', () => ({
	updateRecipeCookingMethods: vi.fn(),
	updateRecipeInstructions: vi.fn(),
}));

import { updateRecipeCookingMethods, updateRecipeInstructions } from '@/repositories';

const logger = createNoopLogger();
const recipeId = 'recipe-123';
const userId = '00000000-0000-0000-0000-000000000001';
const sectionId = 'section-456';
const methodId = 'method-789';

const mockSavedMethods = [
	{ id: methodId, recipeSectionId: sectionId, name: 'Standard', order: 0 },
] as unknown as RecipeCookingMethodDBRead[];

describe('saveRecipeCookingMethods', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(updateRecipeCookingMethods).mockResolvedValue(mockSavedMethods);
		vi.mocked(updateRecipeInstructions).mockResolvedValue([]);
	});

	it('calls updateRecipeCookingMethods for each section', async () => {
		const sectionsData: RecipeSectionCookingMethodsInput[] = [
			{ sectionId, cookingMethods: [{ name: 'Standard', order: 0, instructions: [] }] },
		];

		await saveRecipeCookingMethods(recipeId, sectionsData, userId, logger);

		expect(updateRecipeCookingMethods).toHaveBeenCalledWith(
			sectionId,
			[{ id: undefined, name: 'Standard', order: 0 }],
			userId,
			logger,
		);
	});

	it('calls updateRecipeInstructions for each saved cooking method', async () => {
		const instructions = [{ stepNumber: 1, instruction: 'Mix well', createdBy: userId }];
		const sectionsData: RecipeSectionCookingMethodsInput[] = [
			{ sectionId, cookingMethods: [{ name: 'Standard', order: 0, instructions }] },
		];

		await saveRecipeCookingMethods(recipeId, sectionsData, userId, logger);

		expect(updateRecipeInstructions).toHaveBeenCalledWith(methodId, instructions, userId, logger);
	});

	it('handles multiple sections', async () => {
		const sectionId2 = 'section-999';
		const mockMethods2 = [
			{ id: 'method-888', recipeSectionId: sectionId2, name: 'Standard', order: 0 },
		] as unknown as RecipeCookingMethodDBRead[];
		vi.mocked(updateRecipeCookingMethods).mockResolvedValueOnce(mockSavedMethods).mockResolvedValueOnce(mockMethods2);

		const sectionsData: RecipeSectionCookingMethodsInput[] = [
			{ sectionId, cookingMethods: [{ name: 'Standard', order: 0, instructions: [] }] },
			{ sectionId: sectionId2, cookingMethods: [{ name: 'Standard', order: 0, instructions: [] }] },
		];

		await saveRecipeCookingMethods(recipeId, sectionsData, userId, logger);

		expect(updateRecipeCookingMethods).toHaveBeenCalledTimes(2);
		expect(updateRecipeInstructions).toHaveBeenCalledTimes(2);
	});

	it('throws RzStepError 400 when updateRecipeCookingMethods fails', async () => {
		vi.mocked(updateRecipeCookingMethods).mockRejectedValueOnce(new Error('DB error'));
		const sectionsData: RecipeSectionCookingMethodsInput[] = [
			{ sectionId, cookingMethods: [{ name: 'Standard', order: 0, instructions: [] }] },
		];

		await expect(saveRecipeCookingMethods(recipeId, sectionsData, userId, logger)).rejects.toMatchObject({ code: 400 });
	});

	it('throws RzStepError 400 when updateRecipeInstructions fails', async () => {
		vi.mocked(updateRecipeInstructions).mockRejectedValueOnce(new Error('DB error'));
		const sectionsData: RecipeSectionCookingMethodsInput[] = [
			{ sectionId, cookingMethods: [{ name: 'Standard', order: 0, instructions: [] }] },
		];

		await expect(saveRecipeCookingMethods(recipeId, sectionsData, userId, logger)).rejects.toMatchObject({ code: 400 });
	});

	it('throws RzStepError when updateRecipeCookingMethods throws a non-Error value', async () => {
		vi.mocked(updateRecipeCookingMethods).mockRejectedValueOnce('string error');
		const sectionsData: RecipeSectionCookingMethodsInput[] = [
			{ sectionId, cookingMethods: [{ name: 'Standard', order: 0, instructions: [] }] },
		];

		await expect(saveRecipeCookingMethods(recipeId, sectionsData, userId, logger)).rejects.toThrow(RzStepError);
	});
});
