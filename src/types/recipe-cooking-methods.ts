import type { recipeCookingMethods } from '@/models';
import type { RecipeInstructionWriteInput } from './recipe-instructions';

export type RecipeCookingMethodDBRead = typeof recipeCookingMethods.$inferSelect;
export type RecipeCookingMethodWriteInput = Omit<
	typeof recipeCookingMethods.$inferInsert,
	'recipeSectionId' | 'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

export type RecipeSectionCookingMethodsInput = {
	sectionId: string;
	cookingMethods: (RecipeCookingMethodWriteInput & {
		instructions: RecipeInstructionWriteInput[];
	})[];
};

export type ParsedRecipeScrapeCookingMethod = {
	name: string;
	order: number;
	instructions: { stepNumber: number; instruction: string }[];
};
