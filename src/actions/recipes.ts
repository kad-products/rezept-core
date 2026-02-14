'use server';

import { env } from 'cloudflare:workers';
import { requestInfo } from 'rwsdk/worker';
import { updateRecipeIngredients } from '@/repositories/recipe-ingredients';
import { updateRecipeInstructions } from '@/repositories/recipe-instructions';
import { updateSectionsForRecipe } from '@/repositories/recipe-sections';
import { createRecipe, updateRecipe } from '@/repositories/recipes';

import {
	createRecipeIngredientSchema,
	createRecipeInstructionSchema,
	createRecipeSchema,
	createRecipeSectionSchema,
	updateRecipeSchema,
} from '@/schemas';

import type {
	ActionState,
	Recipe,
	RecipeIngredient,
	RecipeIngredientFormSave,
	RecipeInstruction,
	RecipeInstructionFormSave,
	RecipeSection,
	RecipeSectionFormSave,
} from '@/types';
import { extractErrors, formDataToObject, validateFormData } from '@/utils/forms';

export async function saveRecipe(_prevState: ActionState, formData: FormData): Promise<ActionState> {
	const { ctx } = requestInfo;
	const userId = ctx.user?.id;

	if (!userId) {
		return {
			success: false,
			errors: { _form: ['You must be logged in'] },
		};
	}

	console.log(`Form data received: ${JSON.stringify(Object.fromEntries(formData), null, 4)} `);

	//   ______ _______ _______ _____  _____  _______
	//  |_____/ |______ |         |   |_____] |______
	//  |    \_ |______ |_____  __|__ |       |______
	//
	let recipe: Recipe;
	try {
		if (formData.get('id')) {
			const parsed = updateRecipeSchema.safeParse(Object.fromEntries(formData));
			if (!parsed.success) {
				console.log(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
				return {
					success: false,
					errors: parsed.error.flatten().fieldErrors,
				};
			}
			recipe = await updateRecipe(parsed.data.id, parsed.data, userId);
		} else {
			const parsed = createRecipeSchema.safeParse(Object.fromEntries(formData));
			if (!parsed.success) {
				console.log(`Errors: ${JSON.stringify(parsed.error.flatten().fieldErrors, null, 4)}`);
				return {
					success: false,
					errors: parsed.error.flatten().fieldErrors,
				};
			}
			recipe = await createRecipe(parsed.data, userId);
		}
	} catch (error) {
		console.log(`Error saving recipe: ${error} `);

		console.log(error);

		const errorMessage =
			env.REZEPT_ENV === 'development' ? (error instanceof Error ? error.message : String(error)) : 'Failed to save item';

		return {
			success: false,
			errors: { _form: [errorMessage] },
		};
	}

	// will hopefully be able to remove this once we move to typed input
	const formDataObj = formDataToObject(formData);

	//  _______ _______ _______ _______ _____  _____  __   _ _______
	//  |______ |______ |          |      |   |     | | \  | |______
	//  ______| |______ |_____     |    __|__ |_____| |  \_| ______|
	//
	const sectionValidationResults = (formDataObj.sections as RecipeSection[]).map((s: RecipeSection, sectionIdx: number) =>
		validateFormData({ ...s, recipeId: recipe.id }, createRecipeSectionSchema, `sections.${sectionIdx}.`),
	);
	const sectionErrors = extractErrors(sectionValidationResults);

	console.log(`Section validation results: ${JSON.stringify(sectionValidationResults, null, 4)}`);

	if (sectionErrors) {
		return {
			success: false,
			errors: sectionErrors,
		};
	}

	const sections: RecipeSectionFormSave[] = sectionValidationResults.map(r => r.data).filter(Boolean) as RecipeSectionFormSave[];

	await updateSectionsForRecipe(recipe.id, sections, userId);

	//  _____ __   _ _______ _______  ______ _     _ _______ _______ _____  _____  __   _ _______
	//    |   | \  | |______    |    |_____/ |     | |          |      |   |     | | \  | |______
	//  __|__ |  \_| ______|    |    |    \_ |_____| |_____     |    __|__ |_____| |  \_| ______|
	//
	// remove instructions with empty instruction text and no id, we assume that means it is the empty "new instruction" field
	formDataObj.instructions = (formDataObj.instructions as RecipeInstruction[]).filter(
		(inst: RecipeInstruction) => inst.instruction.trim() !== '' || inst.id,
	);

	const instructionsValidationResults = (formDataObj.instructions as RecipeInstruction[]).map(
		(i: RecipeInstruction, instIdx: number) => validateFormData(i, createRecipeInstructionSchema, `instructions.${instIdx}.`),
	);
	const instructionErrors = extractErrors(instructionsValidationResults);

	console.log(`Instruction validation results: ${JSON.stringify(instructionsValidationResults, null, 4)}`);

	if (instructionErrors) {
		return {
			success: false,
			errors: instructionErrors,
		};
	}

	const instructions: RecipeInstructionFormSave[] = instructionsValidationResults
		.map(r => r.data)
		.filter(Boolean) as RecipeInstructionFormSave[];

	await updateRecipeInstructions(recipe.id, instructions, userId);

	//  _____ __   _  ______  ______ _______ ______  _____ _______ __   _ _______ _______
	//    |   | \  | |  ____ |_____/ |______ |     \   |   |______ | \  |    |    |______
	//  __|__ |  \_| |_____| |    \_ |______ |_____/ __|__ |______ |  \_|    |    ______|
	//
	// remove ingredients with empty ingredientId and no id, we assume that means it is the empty "new ingredient" field
	// TODO: remove the --- select ingredient --- string from this
	formDataObj.ingredients = (formDataObj.ingredients as RecipeIngredient[]).filter(
		(ing: RecipeIngredient) => ing.ingredientId !== '--- select ingredient ---' || ing.id,
	);

	const ingredientsValidationResults = (formDataObj.ingredients as RecipeIngredient[]).map(
		(i: RecipeIngredient, ingIdx: number) => validateFormData(i, createRecipeIngredientSchema, `ingredients.${ingIdx}.`),
	);

	const ingredientErrors = extractErrors(ingredientsValidationResults);

	console.log(`Ingredient validation results: ${JSON.stringify(ingredientsValidationResults, null, 4)}`);

	if (ingredientErrors) {
		return {
			success: false,
			errors: ingredientErrors,
		};
	}

	const ingredients: RecipeIngredientFormSave[] = ingredientsValidationResults
		.map(r => r.data)
		.filter(Boolean) as RecipeIngredientFormSave[];

	await updateRecipeIngredients(recipe.id, ingredients, userId);

	return { success: true };
}
