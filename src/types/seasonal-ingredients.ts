import type { seasonalIngredients } from '@/models';
import type { IngredientDBRead } from './ingredients';

export type SeasonalIngredientDBRead = typeof seasonalIngredients.$inferSelect;

export type SeasonalIngredientWithRelations = SeasonalIngredientDBRead & {
	ingredient: IngredientDBRead;
};
