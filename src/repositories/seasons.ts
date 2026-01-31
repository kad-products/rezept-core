import { eq } from 'drizzle-orm';
import db from '@/db';
import { type Season, seasons } from '@/models/schema';

export async function getSeasons(): Promise<Season[]> {
	const allSeasons = await db.select().from(seasons);
	return allSeasons;
}

export async function getSeasonById(seasonId: string): Promise<Season | undefined> {
	const matchedSeasons = await db.select().from(seasons).where(eq(seasons.id, seasonId));
	if (matchedSeasons.length > 1) {
		throw new Error(
			`getSeasonById: matchedSeasons length is ${matchedSeasons.length} for id ${seasonId}`,
		);
	}

	if (matchedSeasons.length === 0) {
		return undefined;
	}

	return matchedSeasons[0];
}
