import { RzRepositoryError, RzRepositoryErrorTypes, RzStepError } from '@/classes';
import {
	createIngredientSeason,
	getIngredientSeasonsByIngredientIds,
	getIngredientsByNames,
	normalizeApostrophes,
	updateIngredientSeason,
} from '@/repositories';
import type { IngredientSeasonLoadRecord, IngredientSeasonsDBRead, IngredientSeasonWriteInput, RzLogger } from '@/types';

export async function saveGrowingZonesSeasonsLoad(
	records: IngredientSeasonLoadRecord[],
	growingZoneId: string,
	userId: string,
	logger: RzLogger,
): Promise<IngredientSeasonsDBRead[]> {
	logger.debug(`Processing ${records.length} ingredient season load records`);

	try {
		// Batch-resolve ingredient names that don't already have an ID
		const namesToResolve = [
			// biome-ignore lint/style/noNonNullAssertion: guaranteed by the filter() in this same line
			...new Set(records.filter(r => !r.ingredientId && r.ingredientName).map(r => r.ingredientName!)),
		];
		const ingredientsByName = namesToResolve.length > 0 ? await getIngredientsByNames(namesToResolve, logger) : [];
		const ingredientIdByName = new Map(ingredientsByName.map(ing => [ing.name, ing.id]));

		// Resolve ingredient IDs for all records, throwing early for unresolvable ones
		const resolved = records.map((record, idx) => {
			const ingredientId = record.ingredientId ?? ingredientIdByName.get(normalizeApostrophes(record.ingredientName ?? ''));
			if (!ingredientId) {
				const identifier = record.ingredientId ?? record.ingredientName ?? '(unknown)';
				throw new RzStepError(
					422,
					'Ingredient not found',
					`Row ${idx + 1}: no ingredient found for identifier "${identifier}"`,
					false,
				);
			}
			return { record, ingredientId };
		});

		const withSeasonId = resolved.filter(
			(r): r is typeof r & { record: IngredientSeasonLoadRecord & { id: string } } => r.record.id !== undefined,
		);
		const withoutSeasonId = resolved.filter(r => r.record.id === undefined);

		// Batch-lookup existing seasons for the name-matched records (to decide create vs update)
		const ingredientIds = [...new Set(withoutSeasonId.map(r => r.ingredientId))];
		const existingSeasons =
			ingredientIds.length > 0 ? await getIngredientSeasonsByIngredientIds(ingredientIds, growingZoneId, logger) : [];

		const results = await Promise.all([
			// Name/id-matched records: find existing season by (ingredientId, growingZoneId), then update or create
			...withoutSeasonId.map(async ({ record, ingredientId }) => {
				const existing = existingSeasons.find(s => s.ingredientId === ingredientId);
				const payload = buildPayload(record, ingredientId, growingZoneId);
				if (existing) {
					return updateIngredientSeason(existing.id, payload, userId, logger);
				}
				return createIngredientSeason(payload, userId, logger);
			}),
			// Season-ID records: try update by season ID, fall back to create with that ID
			...withSeasonId.map(async ({ record, ingredientId }) => {
				const payload = buildPayload(record, ingredientId, growingZoneId);
				try {
					return await updateIngredientSeason(record.id, payload, userId, logger);
				} catch (err) {
					if (err instanceof RzRepositoryError && err.type === RzRepositoryErrorTypes.UnexpectedRecordCount) {
						return createIngredientSeason({ id: record.id, ...payload }, userId, logger);
					}
					throw err;
				}
			}),
		]);

		logger.info(`Saved ${results.length} ingredient seasons from load`);
		return results;
	} catch (err) {
		if (err instanceof RzStepError) throw err;
		logger.warn(`Error saving ingredient season load: ${err}`);
		throw new RzStepError(500, 'Failed to save ingredient seasons', `Error saving ingredient season load: ${err}`, false, err);
	}
}

function buildPayload(
	record: IngredientSeasonLoadRecord,
	ingredientId: string,
	growingZoneId: string,
): IngredientSeasonWriteInput {
	if (record.startMonth == null || record.endMonth == null) {
		throw new RzStepError(
			422,
			'Invalid season data',
			`Record for ingredient "${ingredientId}" is missing startMonth or endMonth`,
			false,
		);
	}
	const payload: IngredientSeasonWriteInput = {
		ingredientId,
		growingZoneId,
		startMonth: record.startMonth,
		endMonth: record.endMonth,
	};
	if (record.notes !== undefined) {
		payload.notes = record.notes || null;
	}
	return payload;
}
