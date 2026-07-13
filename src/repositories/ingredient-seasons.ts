import { and, eq, isNull, sql } from 'drizzle-orm';
import { RzRepositoryError, RzRepositoryErrorTypes } from '@/classes';
import db from '@/db';
import { ingredientSeasons, verifications } from '@/models';
import type { IngredientSeasonsDBRead, IngredientSeasonWriteInput, RzLogger, VerificationsDBRead } from '@/types';
import { validateUuid } from './utils';

export async function getIngredientSeasons(ingredientId: string, logger: RzLogger): Promise<IngredientSeasonsDBRead[]> {
	logger.debug(`Fetching seasons for ingredient ${ingredientId}`);
	const seasons = await db
		.select()
		.from(ingredientSeasons)
		.where(and(eq(ingredientSeasons.ingredientId, ingredientId), isNull(ingredientSeasons.deletedAt)));
	logger.debug(`Fetched ${seasons.length} seasons for ingredient ${ingredientId}`);
	return seasons;
}

export async function createIngredientSeason(
	ingredientSeason: IngredientSeasonWriteInput,
	userId: string,
	logger: RzLogger,
): Promise<IngredientSeasonsDBRead> {
	logger.debug('Creating ingredient season');
	if (ingredientSeason.id && !validateUuid(ingredientSeason.id)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [ingredientSeason.id, 'Ingredient Season']);
	}

	if (!validateUuid(ingredientSeason.ingredientId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [ingredientSeason.ingredientId, 'Ingredient']);
	}

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
	if (!validateUuid(ingredientSeasonId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [ingredientSeasonId, 'Ingredient Season']);
	}

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

export async function verifyIngredientSeason(
	ingredientSeasonId: string,
	userId: string,
	logger: RzLogger,
): Promise<{ ingredientSeason: IngredientSeasonsDBRead; verification: VerificationsDBRead }> {
	if (!validateUuid(ingredientSeasonId)) {
		throw new RzRepositoryError(RzRepositoryErrorTypes.InvalidUUID, [ingredientSeasonId, 'Ingredient Season']);
	}
	logger.debug(`Verifying ingredient season ${ingredientSeasonId}`);

	const [verificationRecord] = await db
		.insert(verifications)
		.values({
			ingredientSeasonId,
			createdBy: userId,
		})
		.returning();

	const [updatedIngredientSeason] = await db
		.update(ingredientSeasons)
		.set({
			lastVerifiedAt: verificationRecord.createdAt,
			updatedAt: verificationRecord.createdAt,
			updatedBy: userId,
		})
		.where(eq(ingredientSeasons.id, ingredientSeasonId))
		.returning();

	logger.info(`Marked ingredient season ${ingredientSeasonId} as verified`);

	return {
		ingredientSeason: updatedIngredientSeason,
		verification: verificationRecord,
	};
}
