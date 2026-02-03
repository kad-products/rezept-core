'use server';

import { env } from 'cloudflare:workers';
import { requestInfo } from 'rwsdk/worker';
import type { ZodType } from 'zod';
import type { RecipeIngredient } from '@/models/recipe-ingredients';
import type { RecipeInstruction } from '@/models/recipe-instructions';
import type { RecipeSection } from '@/models/recipe-sections';

import {
	createRecipeIngredientFormValidationSchema,
	updateRecipeIngredients,
} from '@/repositories/recipe-ingredients';
import {
	createRecipeInstructionFormValidationSchema,
	updateRecipeInstructions,
} from '@/repositories/recipe-instructions';
import {
	createRecipeSectionFormValidationSchema,
	updateSectionsForRecipe,
} from '@/repositories/recipe-sections';
import {
	createRecipe,
	createRecipeFormValidationSchema,
	updateRecipe,
} from '@/repositories/recipes';
import type { ActionState } from '@/types';
import { formDataToObject } from '@/utils';

export async function saveRecipe(
	_prevState: ActionState,
	formData: FormData,
): Promise<ActionState> {
	const { ctx } = requestInfo;
	const userId = ctx.user?.id;

	if (!userId) {
		return {
			success: false,
			errors: { _form: ['You must be logged in'] },
		};
	}

	const formDataObj = formDataToObject(formData);

	console.log(`Form data received: ${JSON.stringify(formDataObj, null, 4)} `);

	const parsed = createRecipeFormValidationSchema.safeParse(formDataObj);

	console.log(`Form data received: ${JSON.stringify(parsed, null, 4)} `);

	if (!parsed.success) {
		console.log(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
		return {
			success: false,
			errors: parsed.error.flatten().fieldErrors,
		};
	}

	try {
		let recipeId: string = parsed.data.id || '';
		if (!parsed.data.id) {
			const [newRecipe] = await createRecipe(parsed.data, userId);
			recipeId = newRecipe.id;
		} else {
			await updateRecipe(parsed.data.id, parsed.data, userId);
		}

		//  _______ _______ _______ _______ _____  _____  __   _ _______
		//  |______ |______ |          |      |   |     | | \  | |______
		//  ______| |______ |_____     |    __|__ |_____| |  \_| ______|
		//
		const sectionsValidatedData = await validateFormData(
			(formDataObj.sections as RecipeSection[]).map((s: RecipeSection) => ({ ...s, recipeId })),
			createRecipeSectionFormValidationSchema,
			(idx: number, key: string) => `sections.${idx}.${key}`,
		);

		if (sectionsValidatedData.errors) {
			return {
				success: false,
				errors: sectionsValidatedData.errors,
			};
		}

		await updateSectionsForRecipe(recipeId, sectionsValidatedData.data, userId);

		//  _____ __   _ _______ _______  ______ _     _ _______ _______ _____  _____  __   _ _______
		//    |   | \  | |______    |    |_____/ |     | |          |      |   |     | | \  | |______
		//  __|__ |  \_| ______|    |    |    \_ |_____| |_____     |    __|__ |_____| |  \_| ______|
		//
		// remove instructions with empty instruction text and no id, we assume that means it is the empty "new instruction" field
		formDataObj.instructions = (formDataObj.instructions as RecipeInstruction[]).filter(
			(inst: RecipeInstruction) => inst.instruction.trim() !== '' || inst.id,
		);

		const instructionsValidatedData = await validateFormData(
			formDataObj.instructions,
			createRecipeInstructionFormValidationSchema,
			(idx: number, key: string) => `instructions.${idx}.${key}`,
		);

		if (instructionsValidatedData.errors) {
			return {
				success: false,
				errors: instructionsValidatedData.errors,
			};
		}

		// validate and parse instructions
		console.log(
			`Updating instructions: ${JSON.stringify(instructionsValidatedData.data, null, 4)} `,
		);

		await updateRecipeInstructions(recipeId, instructionsValidatedData.data, userId);

		//  _____ __   _  ______  ______ _______ ______  _____ _______ __   _ _______ _______
		//    |   | \  | |  ____ |_____/ |______ |     \   |   |______ | \  |    |    |______
		//  __|__ |  \_| |_____| |    \_ |______ |_____/ __|__ |______ |  \_|    |    ______|
		//
		// remove ingredients with empty ingredientId and no id, we assume that means it is the empty "new ingredient" field
		// TODO: remove the --- select ingredient --- string from this
		formDataObj.ingredients = (formDataObj.ingredients as RecipeIngredient[]).filter(
			(ing: RecipeIngredient) => ing.ingredientId !== '--- select ingredient ---' || ing.id,
		);

		const ingredientsValidatedData = await validateFormData(
			formDataObj.ingredients,
			createRecipeIngredientFormValidationSchema,
			(idx: number, key: string) => `ingredients.${idx}.${key}`,
		);

		if (ingredientsValidatedData.errors) {
			return {
				success: false,
				errors: ingredientsValidatedData.errors,
			};
		}

		await updateRecipeIngredients(recipeId, ingredientsValidatedData.data, userId);

		return { success: true };
	} catch (error) {
		console.log(`Error saving recipe: ${error} `);

		console.log(error);

		const errorMessage =
			env.REZEPT_ENV === 'development'
				? error instanceof Error
					? error.message
					: String(error)
				: 'Failed to save recipe';

		return {
			success: false,
			errors: { _form: [errorMessage] },
		};
	}
}

type FormValidationResponse<T> = {
	errors?: Record<string, string[]>;
	data?: T[];
};

async function validateFormData<T>(
	inputData: unknown,
	validationSchema: ZodType<T>,
	keyPattern: (idx: number, key: string) => string,
): Promise<FormValidationResponse<T>> {
	console.log(`Validation input: ${JSON.stringify(inputData, null, 4)}`);

	// Type guard: ensure inputData is an array
	if (!Array.isArray(inputData)) {
		return {
			errors: { _form: ['Invalid input data - expected array'] },
		};
	}

	// validate and parse
	const parsedData = await Promise.all(
		inputData.map(async (item: unknown) => validationSchema.safeParse(item)),
	);

	if (!parsedData.every(p => p.success)) {
		const errors = parsedData
			.map((p, idx) => {
				// we include successful items initially so the `idx` matches how it came into the
				// validation method but we don't actually need to process it
				if (p.success) {
					return null;
				}
				const fieldErrors = p.error.flatten().fieldErrors;
				const mappedErrors: Record<string, string[]> = {};

				for (const [key, value] of Object.entries(fieldErrors)) {
					const newKey = keyPattern(idx, key);
					mappedErrors[newKey] = Array.isArray(value) ? value : [value];
				}

				return mappedErrors;
			})
			.filter(Boolean); // filter out the successful ones

		console.log(`Validation Errors: ${JSON.stringify(errors, null, 4)}`);

		return {
			errors: Object.assign({}, ...errors),
		};
	}

	const validatedData = parsedData.map(p => (p as { success: true; data: T }).data);

	console.log(`Parsed and validated data: ${JSON.stringify(validatedData, null, 4)}`);

	return {
		data: validatedData,
	};
}
