import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RzRepositoryError, RzRepositoryErrorTypes, RzStepError } from '@/classes';
import { createNoopLogger } from '@/logger';

vi.mock('@/repositories', () => ({
	getIngredientsByNames: vi.fn(),
	createIngredient: vi.fn(),
	updateIngredient: vi.fn(),
}));

import { createIngredient, getIngredientsByNames, updateIngredient } from '@/repositories';
import { saveIngredientLoad } from '@/steps';
import type { IngredientDBRead } from '@/types';

const logger = createNoopLogger();
const userId = '00000000-0000-0000-0000-000000000001';
const existingId = '00000000-0000-0000-0000-000000000002';
const newId = '00000000-0000-0000-0000-000000000003';

function makeIngredient(overrides: Partial<IngredientDBRead> = {}): IngredientDBRead {
	return {
		id: existingId,
		name: 'bacon',
		description: null,
		hasSeasons: false,
		lastVerifiedAt: null,
		createdAt: '2024-01-01T00:00:00.000Z',
		createdBy: userId,
		updatedAt: null,
		updatedBy: null,
		deletedAt: null,
		deletedBy: null,
		...overrides,
	};
}

describe('saveIngredientLoad', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('name-based records (no id in record)', () => {
		it('creates a new ingredient when no match found by name', async () => {
			const newIngredient = makeIngredient({ id: newId, name: 'tomato' });
			vi.mocked(getIngredientsByNames).mockResolvedValue([]);
			vi.mocked(createIngredient).mockResolvedValue(newIngredient);

			const result = await saveIngredientLoad([{ name: 'tomato' }], userId, logger);

			expect(createIngredient).toHaveBeenCalledWith({ name: 'tomato' }, userId, logger);
			expect(result).toEqual([newIngredient]);
		});

		it('updates an existing ingredient found by name', async () => {
			const existing = makeIngredient({ name: 'bacon' });
			const updated = makeIngredient({ name: 'bacon', hasSeasons: true });
			vi.mocked(getIngredientsByNames).mockResolvedValue([existing]);
			vi.mocked(updateIngredient).mockResolvedValue(updated);

			await saveIngredientLoad([{ name: 'bacon', hasSeasons: true }], userId, logger);

			expect(updateIngredient).toHaveBeenCalledWith(existing.id, { name: 'bacon', hasSeasons: true }, userId, logger);
			expect(createIngredient).not.toHaveBeenCalled();
		});

		it('passes hasSeasons in payload when defined in record', async () => {
			vi.mocked(getIngredientsByNames).mockResolvedValue([]);
			vi.mocked(createIngredient).mockResolvedValue(makeIngredient());

			await saveIngredientLoad([{ name: 'tomato', hasSeasons: false }], userId, logger);

			expect(createIngredient).toHaveBeenCalledWith({ name: 'tomato', hasSeasons: false }, userId, logger);
		});

		it('omits hasSeasons from payload when undefined in record', async () => {
			vi.mocked(getIngredientsByNames).mockResolvedValue([]);
			vi.mocked(createIngredient).mockResolvedValue(makeIngredient());

			await saveIngredientLoad([{ name: 'tomato' }], userId, logger);

			const [payload] = vi.mocked(createIngredient).mock.calls[0];
			expect(payload).not.toHaveProperty('hasSeasons');
		});

		it('passes description in payload when defined in record', async () => {
			vi.mocked(getIngredientsByNames).mockResolvedValue([]);
			vi.mocked(createIngredient).mockResolvedValue(makeIngredient());

			await saveIngredientLoad([{ name: 'tomato', description: 'A red fruit' }], userId, logger);

			expect(createIngredient).toHaveBeenCalledWith({ name: 'tomato', description: 'A red fruit' }, userId, logger);
		});

		it('converts empty string description to null', async () => {
			vi.mocked(getIngredientsByNames).mockResolvedValue([]);
			vi.mocked(createIngredient).mockResolvedValue(makeIngredient());

			await saveIngredientLoad([{ name: 'tomato', description: '' }], userId, logger);

			expect(createIngredient).toHaveBeenCalledWith({ name: 'tomato', description: null }, userId, logger);
		});

		it('omits description from payload when undefined in record', async () => {
			vi.mocked(getIngredientsByNames).mockResolvedValue([]);
			vi.mocked(createIngredient).mockResolvedValue(makeIngredient());

			await saveIngredientLoad([{ name: 'tomato' }], userId, logger);

			const [payload] = vi.mocked(createIngredient).mock.calls[0];
			expect(payload).not.toHaveProperty('description');
		});

		it('does not call getIngredientsByNames when all records have ids', async () => {
			vi.mocked(updateIngredient).mockResolvedValue(makeIngredient());

			await saveIngredientLoad([{ id: existingId, name: 'bacon' }], userId, logger);

			expect(getIngredientsByNames).not.toHaveBeenCalled();
		});
	});

	describe('id-based records', () => {
		it('updates by id when the ingredient exists', async () => {
			const updated = makeIngredient({ hasSeasons: true });
			vi.mocked(updateIngredient).mockResolvedValue(updated);

			const result = await saveIngredientLoad([{ id: existingId, name: 'bacon', hasSeasons: true }], userId, logger);

			expect(updateIngredient).toHaveBeenCalledWith(existingId, { name: 'bacon', hasSeasons: true }, userId, logger);
			expect(createIngredient).not.toHaveBeenCalled();
			expect(result).toEqual([updated]);
		});

		it('falls back to create with the given id when update finds no record', async () => {
			const created = makeIngredient({ id: existingId });
			vi.mocked(updateIngredient).mockRejectedValue(
				new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [0, 1, 'Ingredient']),
			);
			vi.mocked(createIngredient).mockResolvedValue(created);

			await saveIngredientLoad([{ id: existingId, name: 'bacon' }], userId, logger);

			expect(createIngredient).toHaveBeenCalledWith({ id: existingId, name: 'bacon' }, userId, logger);
		});

		it('skips name lookup for id-based records', async () => {
			vi.mocked(updateIngredient).mockResolvedValue(makeIngredient());

			await saveIngredientLoad([{ id: existingId, name: 'bacon' }], userId, logger);

			expect(getIngredientsByNames).not.toHaveBeenCalled();
		});

		it('rethrows non-UnexpectedRecordCount repo errors from update', async () => {
			vi.mocked(updateIngredient).mockRejectedValue(
				new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, ['bad-id', 'Ingredient']),
			);

			await expect(saveIngredientLoad([{ id: existingId, name: 'bacon' }], userId, logger)).rejects.toThrow(RzStepError);
		});
	});

	describe('error handling', () => {
		it('throws RzStepError(500) when getIngredientsByNames rejects', async () => {
			vi.mocked(getIngredientsByNames).mockRejectedValue(new Error('DB error'));

			await expect(saveIngredientLoad([{ name: 'tomato' }], userId, logger)).rejects.toMatchObject({ code: 500 });
		});

		it('throws RzStepError(500) when createIngredient rejects', async () => {
			vi.mocked(getIngredientsByNames).mockResolvedValue([]);
			vi.mocked(createIngredient).mockRejectedValue(new Error('constraint violation'));

			await expect(saveIngredientLoad([{ name: 'tomato' }], userId, logger)).rejects.toMatchObject({ code: 500 });
		});

		it('throws RzStepError when any repo call fails', async () => {
			vi.mocked(getIngredientsByNames).mockRejectedValue(new Error('DB error'));

			await expect(saveIngredientLoad([{ name: 'tomato' }], userId, logger)).rejects.toBeInstanceOf(RzStepError);
		});

		it('returns results for all records when no errors occur', async () => {
			const ing1 = makeIngredient({ id: newId, name: 'tomato' });
			const ing2 = makeIngredient({ name: 'bacon' });
			vi.mocked(getIngredientsByNames).mockResolvedValue([ing2]);
			vi.mocked(createIngredient).mockResolvedValue(ing1);
			vi.mocked(updateIngredient).mockResolvedValue(ing2);

			const result = await saveIngredientLoad([{ name: 'tomato' }, { name: 'bacon' }], userId, logger);

			expect(result).toHaveLength(2);
		});
	});
});
