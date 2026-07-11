import type { z } from 'zod';
import type { ingredientSeasons } from '@/models';
import type { ingredientSeasonsSchemas } from '@/schemas';

export type IngredientSeasonsDBRead = typeof ingredientSeasons.$inferSelect;
export type IngredientSeasonWriteInput = Omit<
	typeof ingredientSeasons.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

export type IngredientSeasonFormInput = z.input<typeof ingredientSeasonsSchemas.form>;
