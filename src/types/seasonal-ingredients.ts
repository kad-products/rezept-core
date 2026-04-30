import type { seasonalIngredients } from '@/models';
import type { Ingredient } from './ingredients';

export type SeasonalIngredient = typeof seasonalIngredients.$inferSelect;

export type SeasonalIngredientWithRelations = SeasonalIngredient & {
	ingredient: Ingredient;
};
