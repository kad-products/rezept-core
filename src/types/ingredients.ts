import type { z } from 'zod';
import type { ingredients } from '@/models';
import type { ingredientsSchemas } from '@/schemas';
import type { IngredientSeasonsDBRead, VerificationsDBRead } from '@/types';

export type IngredientDBRead = typeof ingredients.$inferSelect;
export type IngredientFormInput = z.input<typeof ingredientsSchemas.form>;

export type IngredientWithSeasons = IngredientDBRead & {
	seasons: IngredientSeasonsDBRead[];
	verifications: VerificationsDBRead[];
};
