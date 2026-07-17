import type { z } from 'zod';
import type { ingredients } from '@/models';
import type { ingredientsSchemas } from '@/schemas';
import type { IngredientSeasonsDBRead, VerificationsDBRead } from '@/types';

export type IngredientDBRead = typeof ingredients.$inferSelect;
export type IngredientFormInput = z.input<typeof ingredientsSchemas.form>;

export type IngredientLoadRecord = {
	id?: string | undefined;
	name: string;
	description?: string | null | undefined;
	hasSeasons?: boolean | undefined;
};

export type IngredientWithSeasons = IngredientDBRead & {
	seasons: (IngredientSeasonsDBRead & { verifications: VerificationsDBRead[] })[];
	verifications: VerificationsDBRead[];
};
