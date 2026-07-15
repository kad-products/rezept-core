import { RzRepositoryError, RzRepositoryErrorTypes, RzStepError } from '@/classes';
import { createIngredient, getIngredientsByNames, updateIngredient } from '@/repositories';
import type { IngredientDBRead, IngredientFormInput, IngredientLoadRecord, RzLogger } from '@/types';

export async function saveIngredientLoad(
	records: IngredientLoadRecord[],
	userId: string,
	logger: RzLogger,
): Promise<IngredientDBRead[]> {
	logger.debug(`Processing ${records.length} ingredient load records`);

	try {
		const withId = records.filter((r): r is IngredientLoadRecord & { id: string } => r.id !== undefined);
		const withoutId = records.filter(r => r.id === undefined);

		// Batch lookup existing active ingredients by name for name-based records
		const names = withoutId.map(r => r.name);
		const existingByName = names.length > 0 ? await getIngredientsByNames(names, logger) : [];

		const results = await Promise.all([
			// Name-based records: lookup by name, then create or update
			...withoutId.map(async record => {
				const existing = existingByName.find(ing => ing.name === record.name);
				const payload = buildPayload(record);
				if (existing) {
					return updateIngredient(existing.id, payload, userId, logger);
				}
				return createIngredient(payload, userId, logger);
			}),
			// ID-based records: try update by ID first, fall back to create with that ID
			...withId.map(async record => {
				const payload = buildPayload(record);
				try {
					return await updateIngredient(record.id, payload, userId, logger);
				} catch (err) {
					if (err instanceof RzRepositoryError && err.type === RzRepositoryErrorTypes.UnexpectedRecordCount) {
						return createIngredient({ id: record.id, ...payload }, userId, logger);
					}
					throw err;
				}
			}),
		]);

		logger.info(`Saved ${results.length} ingredients from load`);
		return results;
	} catch (err) {
		if (err instanceof RzStepError) throw err;
		logger.warn(`Error saving ingredient load: ${err}`);
		throw new RzStepError(500, 'Failed to save ingredients', `Error saving ingredient load: ${err}`, false, err);
	}
}

function buildPayload(record: IngredientLoadRecord): Omit<IngredientFormInput, 'id'> {
	const payload: Omit<IngredientFormInput, 'id'> = { name: record.name };
	if (record.hasSeasons !== undefined) {
		payload.hasSeasons = record.hasSeasons;
	}
	if (record.description !== undefined) {
		payload.description = record.description || null;
	}
	return payload;
}
