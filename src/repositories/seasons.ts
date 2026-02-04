import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import db from '@/db';
import { type Season, type SeasonFormSave, seasons } from '@/models/schema';

export async function getSeasons(): Promise<Season[]> {
	const allSeasons = await db.select().from(seasons);
	return allSeasons;
}

export async function getSeasonById(seasonId: string): Promise<Season | undefined> {
	const matchedSeasons = await db.select().from(seasons).where(eq(seasons.id, seasonId));
	if (matchedSeasons.length > 1) {
		throw new Error(`getSeasonById: matchedSeasons length is ${matchedSeasons.length} for id ${seasonId}`);
	}

	if (matchedSeasons.length === 0) {
		return undefined;
	}

	return matchedSeasons[0];
}

export const createSeasonFormValidationSchema = createInsertSchema(seasons, {
	id: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	startMonth: z.coerce.number().min(1).max(12),
	endMonth: z.coerce.number().min(1).max(12),
}).omit({
	createdAt: true,
	createdBy: true,
	updatedAt: true,
	updatedBy: true,
	deletedAt: true,
	deletedBy: true,
});

export async function createSeason(season: SeasonFormSave, userId: string) {
	console.log(`Form data in createSeason: ${JSON.stringify(season, null, 4)} `);

	return await db
		.insert(seasons)
		.values({
			...season,
			createdBy: userId,
		})
		.returning();
}

export async function updateSeason(seasonId: string, seasonData: SeasonFormSave, userId: string) {
	console.log(`Form data in updateSeason: ${JSON.stringify(seasonData, null, 4)} `);

	return await db
		.update(seasons)
		.set({
			...seasonData,
			updatedBy: userId,
		})
		.where(eq(seasons.id, seasonId))
		.returning();
}
