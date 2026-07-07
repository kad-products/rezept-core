import { z } from 'zod';
import { coercedInt, optionalCoercedInt, optionalStringMax, optionalUuid, requiredString, requiredUuid } from './utils';

const ingredientRawSchema = z.object({
	id: optionalUuid,
	raw: z.string().min(1),
	order: coercedInt(0),
});

const ingredientStructuredSchema = z.object({
	id: optionalUuid,
	ingredientId: requiredUuid,
	quantity: z.coerce.number().positive().multipleOf(0.01).optional() as unknown as z.ZodNumber,
	unitId: optionalUuid,
	preparation: optionalStringMax(100, 'Preparation'),
	modifier: optionalStringMax(100, 'Modifier'),
	order: coercedInt(0),
});

const recipeIngredientSchema = z.union([ingredientRawSchema, ingredientStructuredSchema]);

const recipeInstructionSchema = z.object({
	id: optionalUuid,
	stepNumber: coercedInt(1),
	instruction: requiredString('Instruction', 2000),
});

const recipeCookingMethodSchema = z.object({
	id: optionalUuid,
	name: requiredString('Cooking method name', 100),
	order: coercedInt(0),
	instructions: z.array(recipeInstructionSchema).optional(),
});

const recipeSectionSchema = z.object({
	id: optionalUuid, // Present for updates, absent for creates
	title: z
		.string()
		.max(200, 'Title must be 200 characters or less')
		.optional()
		.transform(val => val?.trim() || null),
	order: coercedInt(0),
	ingredients: z.array(recipeIngredientSchema).optional(),
	cookingMethods: z.array(recipeCookingMethodSchema).optional(),
});

// One flexible schema for forms/actions
const recipeFormSchema = z.object({
	id: optionalUuid, // Present for update, absent for create
	authorId: z.string().uuid('Must be a valid UUID'),
	title: requiredString('Title', 200),
	description: optionalStringMax(1000, 'Description'),
	source: optionalStringMax(500, 'Source'),
	servings: optionalCoercedInt(0),
	prepTime: optionalCoercedInt(0),
	cookTime: optionalCoercedInt(0),
	sections: z.array(recipeSectionSchema).optional(),
});

const recipeScrapeSchema = recipeFormSchema.extend({
	sections: z.array(recipeSectionSchema).min(1, 'At least one section is required'),
});

export const recipesSchemas = {
	form: recipeFormSchema,
	scrape: recipeScrapeSchema,
};
