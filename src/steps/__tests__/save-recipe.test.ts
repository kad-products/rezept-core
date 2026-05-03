import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RzStepError } from '@/classes';
import Logger from '@/logger';
import { saveRecipe } from '@/steps';
import type { RecipeDBRead, RecipeFormSave } from '@/types';

vi.mock('@/repositories', () => ({
	createRecipe: vi.fn(),
	updateRecipe: vi.fn(),
}));

import { createRecipe, updateRecipe } from '@/repositories';

const logger = new Logger();
const userId = '00000000-0000-0000-0000-000000000001';
const mockRecipe = { id: 'recipe-123', title: 'Test Recipe', authorId: userId } as unknown as RecipeDBRead;
const baseData: RecipeFormSave = { authorId: userId, title: 'Test Recipe' } as unknown as RecipeFormSave;

describe('saveRecipe', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('calls createRecipe when no id is present and returns the result', async () => {
		vi.mocked(createRecipe).mockResolvedValue(mockRecipe);

		const result = await saveRecipe(baseData, userId, logger);

		expect(createRecipe).toHaveBeenCalledWith(baseData, userId, logger);
		expect(updateRecipe).not.toHaveBeenCalled();
		expect(result).toBe(mockRecipe);
	});

	it('calls updateRecipe when an id is present and returns the result', async () => {
		vi.mocked(updateRecipe).mockResolvedValue(mockRecipe);
		const dataWithId: RecipeFormSave = { ...baseData, id: 'recipe-123' } as unknown as RecipeFormSave;

		const result = await saveRecipe(dataWithId, userId, logger);

		expect(updateRecipe).toHaveBeenCalledWith('recipe-123', dataWithId, userId, logger);
		expect(createRecipe).not.toHaveBeenCalled();
		expect(result).toBe(mockRecipe);
	});

	it('throws RzStepError 400 when createRecipe fails', async () => {
		vi.mocked(createRecipe).mockRejectedValue(new Error('DB connection error'));

		await expect(saveRecipe(baseData, userId, logger)).rejects.toThrow(RzStepError);
		await expect(saveRecipe(baseData, userId, logger)).rejects.toMatchObject({ code: 400 });
	});

	it('throws RzStepError 400 when updateRecipe fails', async () => {
		vi.mocked(updateRecipe).mockRejectedValue(new Error('DB connection error'));
		const dataWithId: RecipeFormSave = { ...baseData, id: 'recipe-123' } as unknown as RecipeFormSave;

		await expect(saveRecipe(dataWithId, userId, logger)).rejects.toThrow(RzStepError);
		await expect(saveRecipe(dataWithId, userId, logger)).rejects.toMatchObject({ code: 400 });
	});
});
