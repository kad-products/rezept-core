import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RzRepositoryError, RzRepositoryErrorTypes, RzStepError } from '@/classes';
import { createNoopLogger } from '@/logger';

vi.mock('@/repositories', () => ({
	getIngredientsByNames: vi.fn(),
	getIngredientSeasonsByIngredientIds: vi.fn(),
	createIngredientSeason: vi.fn(),
	updateIngredientSeason: vi.fn(),
	normalizeApostrophes: (s: string) => s.replace(/[\u0027\u2018\u02BC]/g, '\u2019'),
}));

import {
	createIngredientSeason,
	getIngredientSeasonsByIngredientIds,
	getIngredientsByNames,
	updateIngredientSeason,
} from '@/repositories';
import { saveGrowingZonesSeasonsLoad } from '@/steps';
import type { IngredientDBRead, IngredientSeasonDBRead } from '@/types';

const logger = createNoopLogger();
const userId = '00000000-0000-0000-0000-000000000001';
const growingZoneId = '00000000-0000-0000-0000-000000000010';
const ingredientId = '00000000-0000-0000-0000-000000000002';
const seasonId = '00000000-0000-0000-0000-000000000003';

function makeSeason(overrides: Partial<IngredientSeasonDBRead> = {}): IngredientSeasonDBRead {
	return {
		id: seasonId,
		ingredientId,
		growingZoneId,
		startMonth: 6,
		endMonth: 9,
		notes: null,
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

function makeIngredient(name = 'tomato'): IngredientDBRead {
	return {
		id: ingredientId,
		name,
		description: null,
		hasSeasons: true,
		lastVerifiedAt: null,
		createdAt: '2024-01-01T00:00:00.000Z',
		createdBy: userId,
		updatedAt: null,
		updatedBy: null,
		deletedAt: null,
		deletedBy: null,
	};
}

describe('saveGrowingZonesSeasonsLoad', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getIngredientsByNames).mockResolvedValue([]);
		vi.mocked(getIngredientSeasonsByIngredientIds).mockResolvedValue([]);
		vi.mocked(createIngredientSeason).mockResolvedValue(makeSeason());
		vi.mocked(updateIngredientSeason).mockResolvedValue(makeSeason());
	});

	describe('ingredient resolution', () => {
		it('uses ingredientId directly when present (skips name lookup)', async () => {
			await saveGrowingZonesSeasonsLoad([{ ingredientId, startMonth: 6, endMonth: 9 }], growingZoneId, userId, logger);

			expect(getIngredientsByNames).not.toHaveBeenCalled();
		});

		it('resolves ingredient by name when ingredientId is absent', async () => {
			vi.mocked(getIngredientsByNames).mockResolvedValue([makeIngredient('tomato')]);

			await saveGrowingZonesSeasonsLoad(
				[{ ingredientName: 'tomato', startMonth: 6, endMonth: 9 }],
				growingZoneId,
				userId,
				logger,
			);

			expect(getIngredientsByNames).toHaveBeenCalledWith(['tomato'], logger);
		});

		it('deduplicates name lookups when multiple records share a name', async () => {
			vi.mocked(getIngredientsByNames).mockResolvedValue([makeIngredient('tomato')]);

			await saveGrowingZonesSeasonsLoad(
				[
					{ ingredientName: 'tomato', startMonth: 6, endMonth: 9 },
					{ ingredientName: 'tomato', startMonth: 7, endMonth: 10 },
				],
				growingZoneId,
				userId,
				logger,
			);

			// Called once, not twice
			expect(getIngredientsByNames).toHaveBeenCalledOnce();
			expect(getIngredientsByNames).toHaveBeenCalledWith(['tomato'], logger);
		});

		it('throws RzStepError(422) when ingredient is not found by name', async () => {
			vi.mocked(getIngredientsByNames).mockResolvedValue([]);

			await expect(
				saveGrowingZonesSeasonsLoad([{ ingredientName: 'ghost', startMonth: 6, endMonth: 9 }], growingZoneId, userId, logger),
			).rejects.toMatchObject({ code: 422 });
		});

		it('throws RzStepError(422) when neither ingredientId nor ingredientName is provided', async () => {
			await expect(
				saveGrowingZonesSeasonsLoad([{ startMonth: 6, endMonth: 9 }], growingZoneId, userId, logger),
			).rejects.toMatchObject({ code: 422 });
		});
	});

	describe('season month validation', () => {
		it('throws RzStepError(422) when startMonth is missing', async () => {
			await expect(
				saveGrowingZonesSeasonsLoad([{ ingredientId, endMonth: 9 }], growingZoneId, userId, logger),
			).rejects.toMatchObject({ code: 422 });
		});

		it('throws RzStepError(422) when endMonth is missing', async () => {
			await expect(
				saveGrowingZonesSeasonsLoad([{ ingredientId, startMonth: 6 }], growingZoneId, userId, logger),
			).rejects.toMatchObject({ code: 422 });
		});
	});

	describe('records without a season ID (name/id-matched upsert)', () => {
		it('creates a new season when none exists for (ingredientId, growingZoneId)', async () => {
			vi.mocked(getIngredientSeasonsByIngredientIds).mockResolvedValue([]);

			await saveGrowingZonesSeasonsLoad([{ ingredientId, startMonth: 6, endMonth: 9 }], growingZoneId, userId, logger);

			expect(createIngredientSeason).toHaveBeenCalledWith(
				expect.objectContaining({ ingredientId, growingZoneId, startMonth: 6, endMonth: 9 }),
				userId,
				logger,
			);
			expect(updateIngredientSeason).not.toHaveBeenCalled();
		});

		it('updates existing season when one already exists for (ingredientId, growingZoneId)', async () => {
			vi.mocked(getIngredientSeasonsByIngredientIds).mockResolvedValue([makeSeason()]);

			await saveGrowingZonesSeasonsLoad([{ ingredientId, startMonth: 7, endMonth: 10 }], growingZoneId, userId, logger);

			expect(updateIngredientSeason).toHaveBeenCalledWith(
				seasonId,
				expect.objectContaining({ ingredientId, growingZoneId, startMonth: 7, endMonth: 10 }),
				userId,
				logger,
			);
			expect(createIngredientSeason).not.toHaveBeenCalled();
		});

		it('passes the growingZoneId parameter to the season payload', async () => {
			const differentZoneId = '00000000-0000-0000-0000-000000000099';

			await saveGrowingZonesSeasonsLoad([{ ingredientId, startMonth: 6, endMonth: 9 }], differentZoneId, userId, logger);

			expect(createIngredientSeason).toHaveBeenCalledWith(
				expect.objectContaining({ growingZoneId: differentZoneId }),
				userId,
				logger,
			);
		});

		it('includes notes in the payload when provided', async () => {
			await saveGrowingZonesSeasonsLoad(
				[{ ingredientId, startMonth: 6, endMonth: 9, notes: 'peak season' }],
				growingZoneId,
				userId,
				logger,
			);

			expect(createIngredientSeason).toHaveBeenCalledWith(expect.objectContaining({ notes: 'peak season' }), userId, logger);
		});

		it('omits notes from the payload when notes is undefined', async () => {
			await saveGrowingZonesSeasonsLoad([{ ingredientId, startMonth: 6, endMonth: 9 }], growingZoneId, userId, logger);

			const [payload] = vi.mocked(createIngredientSeason).mock.calls[0];
			expect(payload).not.toHaveProperty('notes');
		});
	});

	describe('records with a season ID (direct upsert by ID)', () => {
		it('updates by season ID when the season exists', async () => {
			await saveGrowingZonesSeasonsLoad(
				[{ id: seasonId, ingredientId, startMonth: 7, endMonth: 10 }],
				growingZoneId,
				userId,
				logger,
			);

			expect(updateIngredientSeason).toHaveBeenCalledWith(
				seasonId,
				expect.objectContaining({ ingredientId, growingZoneId, startMonth: 7, endMonth: 10 }),
				userId,
				logger,
			);
			expect(createIngredientSeason).not.toHaveBeenCalled();
		});

		it('falls back to create with the given season ID when update finds no record', async () => {
			vi.mocked(updateIngredientSeason).mockRejectedValue(
				new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [0, 1, 'Ingredient Season']),
			);

			await saveGrowingZonesSeasonsLoad(
				[{ id: seasonId, ingredientId, startMonth: 6, endMonth: 9 }],
				growingZoneId,
				userId,
				logger,
			);

			expect(createIngredientSeason).toHaveBeenCalledWith(
				expect.objectContaining({ id: seasonId, ingredientId, growingZoneId }),
				userId,
				logger,
			);
		});

		it('skips the existing-season lookup for ID-based records', async () => {
			await saveGrowingZonesSeasonsLoad(
				[{ id: seasonId, ingredientId, startMonth: 6, endMonth: 9 }],
				growingZoneId,
				userId,
				logger,
			);

			expect(getIngredientSeasonsByIngredientIds).not.toHaveBeenCalled();
		});

		it('rethrows non-UnexpectedRecordCount errors from update as RzStepError', async () => {
			vi.mocked(updateIngredientSeason).mockRejectedValue(
				new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, ['bad-id', 'Ingredient Season']),
			);

			await expect(
				saveGrowingZonesSeasonsLoad([{ id: seasonId, ingredientId, startMonth: 6, endMonth: 9 }], growingZoneId, userId, logger),
			).rejects.toBeInstanceOf(RzStepError);
		});
	});

	describe('return value and error handling', () => {
		it('returns the saved season records', async () => {
			const season = makeSeason({ startMonth: 6, endMonth: 9 });
			vi.mocked(createIngredientSeason).mockResolvedValue(season);

			const result = await saveGrowingZonesSeasonsLoad(
				[{ ingredientId, startMonth: 6, endMonth: 9 }],
				growingZoneId,
				userId,
				logger,
			);

			expect(result).toEqual([season]);
		});

		it('returns results for all records when no errors occur', async () => {
			const season1 = makeSeason({ id: 'season-1' });
			const season2 = makeSeason({ id: 'season-2' });
			vi.mocked(createIngredientSeason).mockResolvedValueOnce(season1).mockResolvedValueOnce(season2);

			const result = await saveGrowingZonesSeasonsLoad(
				[
					{ ingredientId, startMonth: 6, endMonth: 9 },
					{ ingredientId: '00000000-0000-0000-0000-000000000005', startMonth: 7, endMonth: 10 },
				],
				growingZoneId,
				userId,
				logger,
			);

			expect(result).toHaveLength(2);
		});

		it('throws RzStepError(500) when getIngredientsByNames rejects', async () => {
			vi.mocked(getIngredientsByNames).mockRejectedValue(new Error('DB error'));

			await expect(
				saveGrowingZonesSeasonsLoad([{ ingredientName: 'tomato', startMonth: 6, endMonth: 9 }], growingZoneId, userId, logger),
			).rejects.toMatchObject({ code: 500 });
		});

		it('throws RzStepError(500) when createIngredientSeason rejects', async () => {
			vi.mocked(createIngredientSeason).mockRejectedValue(new Error('constraint violation'));

			await expect(
				saveGrowingZonesSeasonsLoad([{ ingredientId, startMonth: 6, endMonth: 9 }], growingZoneId, userId, logger),
			).rejects.toMatchObject({ code: 500 });
		});
	});
});
