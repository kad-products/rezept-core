import { z } from 'zod';
import { optionalString, optionalUuid, requiredUuid } from './utils';

const ingredientRawSchema = z.object({
	id: optionalUuid,
	raw: z.string().min(1),
	order: z.coerce.number().int().min(0) as z.ZodNumber,
});

const ingredientStructuredSchema = z.object({
	id: optionalUuid,
	ingredientId: requiredUuid,
	quantity: z.coerce.number().positive().multipleOf(0.01).optional() as unknown as z.ZodNumber,
	unitId: optionalUuid,
	preparation: optionalString
		.transform(val => val?.trim())
		.pipe(z.string().max(100, 'Preparation must be 100 characters or less').optional()),
	modifier: optionalString
		.transform(val => val?.trim())
		.pipe(z.string().max(100, 'Modifier must be 100 characters or less').optional()),
	order: z.coerce.number().int().min(0) as z.ZodNumber,
});

const recipeIngredientSchema = z.union([ingredientRawSchema, ingredientStructuredSchema]);

const recipeSectionSchema = z.object({
	id: optionalUuid, // Present for updates, absent for creates
	title: z
		.string()
		.max(200, 'Title must be 200 characters or less')
		.optional()
		.transform(val => val?.trim() || null),
	order: z.coerce.number().int().min(0) as z.ZodNumber,
	ingredients: z.array(recipeIngredientSchema).optional(),
	instructions: z
		.array(
			z.object({
				id: optionalUuid,
				stepNumber: z.coerce.number().int().min(1) as z.ZodNumber,
				instruction: z.string().trim().min(1, 'Instruction is required').max(2000, 'Instruction must be 2000 characters or less'),
			}),
		)
		.optional(),
});

// One flexible schema for forms/actions
const recipeFormSchema = z.object({
	id: optionalUuid, // Present for update, absent for create
	authorId: z.string().uuid('Must be a valid UUID'),
	title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be 200 characters or less'),
	description: z
		.union([z.string(), z.null()])
		.transform(val => (val === '' ? undefined : val))
		.optional()
		.transform(val => val?.trim())
		.pipe(z.string().max(1000, 'Description must be 1000 characters or less').optional()),
	source: z
		.union([z.string(), z.null()])
		.transform(val => (val === '' ? undefined : val))
		.optional()
		.transform(val => val?.trim())
		.pipe(z.string().max(500, 'Source must be 500 characters or less').optional()),
	servings: z.coerce.number().int().min(0).optional() as z.ZodOptional<z.ZodNumber>,
	prepTime: z.coerce.number().int().min(0).optional() as z.ZodOptional<z.ZodNumber>,
	cookTime: z.coerce.number().int().min(0).optional() as z.ZodOptional<z.ZodNumber>,
	sections: z.array(recipeSectionSchema).optional(),
});

const recipeScrapeSchema = recipeFormSchema.extend({
	sections: z.array(recipeSectionSchema).min(1, 'At least one section is required'),
});

export const recipesSchemas = {
	form: recipeFormSchema,
	scrape: recipeScrapeSchema,
};
