import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RzStepError } from '@/classes';
import Logger from '@/logger';
import { saveRecipeSections } from '@/steps';
import type { RecipeSectionDBRead, RecipeSectionFormSave } from '@/types';

vi.mock('@/repositories', () => ({
	updateRecipeSections: vi.fn(),
}));

import { updateRecipeSections } from '@/repositories';

const logger = new Logger();
const recipeId = 'recipe-123';
const userId = '00000000-0000-0000-0000-000000000001';
const mockSections = [{ id: 'section-1', recipeId, order: 0 }] as unknown as RecipeSectionDBRead[];
const sectionsData = [{ order: 0 }] as unknown as RecipeSectionFormSave[];

describe('saveRecipeSections', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls updateRecipeSections and returns the result', async () => {
		vi.mocked(updateRecipeSections).mockResolvedValue(mockSections);

		const result = await saveRecipeSections(recipeId, sectionsData, userId, logger);

		expect(updateRecipeSections).toHaveBeenCalledWith(recipeId, sectionsData, userId, logger);
		expect(result).toBe(mockSections);
	});

	it('throws RzStepError 400 when updateRecipeSections fails', async () => {
		vi.mocked(updateRecipeSections).mockRejectedValue(new Error('DB connection error'));

		await expect(saveRecipeSections(recipeId, sectionsData, userId, logger)).rejects.toThrow(RzStepError);
		await expect(saveRecipeSections(recipeId, sectionsData, userId, logger)).rejects.toMatchObject({ code: 400 });
	});
});
