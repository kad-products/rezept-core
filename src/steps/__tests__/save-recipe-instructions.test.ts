import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RzStepError } from '@/classes';
import Logger from '@/logger';
import { saveRecipeInstructions } from '@/steps';
import type { IncomingInstructionsData, RecipeInstruction } from '@/types';

vi.mock('@/repositories', () => ({
	updateRecipeInstructions: vi.fn(),
}));

import { updateRecipeInstructions } from '@/repositories';

const logger = new Logger();
const recipeId = 'recipe-123';
const userId = '00000000-0000-0000-0000-000000000001';
const sectionId = 'section-456';
const mockInstructions = [
	{ id: 'instr-1', recipeSectionId: sectionId, stepNumber: 1, instruction: 'Mix well' },
] as unknown as RecipeInstruction[];

describe('saveRecipeInstructions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('returns an empty object when instructionsData is undefined', async () => {
		const result = await saveRecipeInstructions(recipeId, undefined, userId, logger);

		expect(result).toEqual({});
		expect(updateRecipeInstructions).not.toHaveBeenCalled();
	});

	it('saves instructions for a single section and keys the result by sectionId', async () => {
		vi.mocked(updateRecipeInstructions).mockResolvedValue(mockInstructions);
		const instructionsData: IncomingInstructionsData[] = [{ sectionId, instructions: [] }];

		const result = await saveRecipeInstructions(recipeId, instructionsData, userId, logger);

		expect(updateRecipeInstructions).toHaveBeenCalledWith(sectionId, [], userId, logger);
		expect(result).toEqual({ [sectionId]: mockInstructions });
	});

	it('saves instructions for multiple sections', async () => {
		const sectionId2 = 'section-789';
		vi.mocked(updateRecipeInstructions).mockResolvedValue(mockInstructions);
		const instructionsData: IncomingInstructionsData[] = [
			{ sectionId, instructions: [] },
			{ sectionId: sectionId2, instructions: [] },
		];

		const result = await saveRecipeInstructions(recipeId, instructionsData, userId, logger);

		expect(updateRecipeInstructions).toHaveBeenCalledTimes(2);
		expect(result).toHaveProperty(sectionId);
		expect(result).toHaveProperty(sectionId2);
	});

	it('throws RzStepError 400 when updateRecipeInstructions fails', async () => {
		vi.mocked(updateRecipeInstructions).mockRejectedValue(new Error('DB connection error'));
		const instructionsData: IncomingInstructionsData[] = [{ sectionId, instructions: [] }];

		await expect(saveRecipeInstructions(recipeId, instructionsData, userId, logger)).rejects.toThrow(RzStepError);
		await expect(saveRecipeInstructions(recipeId, instructionsData, userId, logger)).rejects.toMatchObject({ code: 400 });
	});
});
