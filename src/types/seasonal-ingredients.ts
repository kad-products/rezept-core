import type { seasonalIngredients } from '@/models';
import type { IngredientDBRead } from './ingredients';

export type SeasonalIngredient = typeof seasonalIngredients.$inferSelect;

export type SeasonalIngredientWithRelations = SeasonalIngredient & {
	ingredient: IngredientDBRead;
};
