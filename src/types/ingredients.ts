import type { z } from 'zod';
import type { ingredients } from '@/models';
import type { ingredientsSchemas } from '@/schemas';

export type IngredientDBRead = typeof ingredients.$inferSelect;
export type IngredientFormInput = z.input<typeof ingredientsSchemas.form>;
