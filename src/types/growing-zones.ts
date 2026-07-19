import type { z } from 'zod';
import type { growingZones } from '@/models';
import type { growingZonesSchemas } from '@/schemas';
import type { IngredientDBRead, IngredientSeasonDBRead } from '@/types';

export type GrowingZoneDBRead = typeof growingZones.$inferSelect;
export type GrowingZoneFormInput = z.input<typeof growingZonesSchemas.form>;

export type GrowingZoneWithSeasons = GrowingZoneDBRead & {
	seasons: (IngredientSeasonDBRead & {
		ingredient: IngredientDBRead;
	})[];
};
