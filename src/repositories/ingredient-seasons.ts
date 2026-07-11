import { eq, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import { ingredientSeasons } from '@/models';
import type { IngredientSeasonsDBRead, IngredientSeasonWriteInput, RzLogger } from '@/types';
import { validateUuid } from './utils';

export async function createIngredientSeason(
	ingredientSeason: IngredientSeasonWriteInput,
	userId: string,
	logger: RzLogger,
): Promise<IngredientSeasonsDBRead> {
	logger.debug('Creating ingredient season');

	const createdIngredientSeason = await db
		.insert(ingredientSeasons)
		.values({
			...ingredientSeason,
			createdBy: userId,
		})
		.returning();

	const result = createdIngredientSeason[0];
	logger.info(`Created ingredient season ${result.id}`);
	return result;
}

export async function updateIngredientSeason(
	ingredientSeasonId: string,
	ingredientSeason: IngredientSeasonWriteInput,
	userId: string,
	logger: RzLogger,
): Promise<IngredientSeasonsDBRead> {
	logger.debug(`Updating ingredient season ${ingredientSeasonId}`);

	const updatedSeasons = await db
		.update(ingredientSeasons)
		.set({
			...ingredientSeason,
			updatedAt: sql`(datetime('now', 'localtime'))`,
			updatedBy: userId,
		})
		.where(eq(ingredientSeasons.id, ingredientSeasonId))
		.returning();

	if (updatedSeasons.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [updatedSeasons.length, 1, 'Ingredient Season']);
	}
	logger.info(`Updated ingredient season ${ingredientSeasonId}`);
	return updatedSeasons[0];
}

export async function deleteIngredientSeason(
	ingredientSeasonId: string,
	actingUserId: string,
	logger: RzLogger,
): Promise<IngredientSeasonsDBRead> {
	if (!validateUuid(ingredientSeasonId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [ingredientSeasonId, 'Ingredient Season']);
	}

	logger.debug(`Deleting ingredient season ${ingredientSeasonId}`);
	const deleted = await db
		.update(ingredientSeasons)
		.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: actingUserId })
		.where(eq(ingredientSeasons.id, ingredientSeasonId))
		.returning();

	if (deleted.length !== 1) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.UnexpectedRecordCount, [deleted.length, 1, 'Ingredient Season']);
	}

	logger.info(`Deleted season ${ingredientSeasonId}`);
	return deleted[0];
}
