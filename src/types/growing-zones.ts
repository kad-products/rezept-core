import type { z } from 'zod';
import type { growingZones } from '@/models';
import type { growingZonesSchemas } from '@/schemas';
import type { IngredientDBRead, IngredientSeasonsDBRead } from '@/types';

export type GrowingZonesDBRead = typeof growingZones.$inferSelect;
export type GrowingZonesFormInput = z.input<typeof growingZonesSchemas.form>;

export type GrowingZonesWithSeasons = GrowingZonesDBRead & {
	seasons: (IngredientSeasonsDBRead & {
		ingredient: IngredientDBRead;
	})[];
};
