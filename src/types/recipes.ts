import type { z } from 'zod';
import type { recipes } from '@/models';
import type { recipesSchemas } from '@/schemas';
import type { ParsedRecipeScrapeSection, RecipeIngredientDBRead, RecipeInstructionDBRead, RecipeSectionDBRead } from '@/types';

export type RecipeDBRead = typeof recipes.$inferSelect;
export type RecipeWriteInput = Omit<
	typeof recipes.$inferInsert,
	'createdAt' | 'createdBy' | 'updatedAt' | 'updatedBy' | 'deletedAt' | 'deletedBy'
>;

// Input type (what the form submits — pre-transform). Use z.input so optional fields
// stay optional, matching what actions receive and tests pass. The post-transform
// output type (with string | null) is used internally via parsed.data.
export type RecipeFormInput = z.input<typeof recipesSchemas.form>;

export type RecipeWithSections = RecipeDBRead & {
	sections: Array<
		RecipeSectionDBRead & {
			ingredients: RecipeIngredientDBRead[];
			instructions: RecipeInstructionDBRead[];
		}
	>;
};

export type ParsedRecipeScrape = {
	title: string;
	description?: string;
	source?: string;
	servings?: number;
	prepTime?: number;
	cookTime?: number;
	sections: ParsedRecipeScrapeSection[];
};
