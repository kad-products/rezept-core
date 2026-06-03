import type { z } from 'zod';
import type { recipes } from '@/models';
import type { recipesSchemas } from '@/schemas';
import type {
	ParsedRecipeScrapeSection,
	RecipeIngredientWithUnit,
	RecipeInstructionDBRead,
	RecipeSectionDBRead,
	UserDBRead,
} from '@/types';

export type RecipeDBRead = typeof recipes.$inferSelect;
export type RecipeWriteInput = Omit<
	typeof recipes.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;
export type RecipeFormInput = z.input<typeof recipesSchemas.form>;

export type RecipeWithSections = RecipeDBRead & {
	author: UserDBRead;
	sections: Array<
		RecipeSectionDBRead & {
			ingredients: RecipeIngredientWithUnit[];
			instructions: RecipeInstructionDBRead[];
		}
	>;
};

export type ParsedRecipeScrapeImage = {
	url: string;
	width?: number;
	height?: number;
};

export type ParsedRecipeScrape = {
	title: string;
	description?: string;
	source?: string;
	servings?: number;
	prepTime?: number;
	cookTime?: number;
	coverImage?: ParsedRecipeScrapeImage;
	sections: ParsedRecipeScrapeSection[];
};
