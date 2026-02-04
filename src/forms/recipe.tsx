'use client';
import { Fragment, useActionState } from 'react';
import FormField from '@/components/client/FormField';
import { saveRecipe } from '@/functions/recipes';
import type { Ingredient, RecipeIngredient, RecipeInstruction, Recipe as RecipeModel, RecipeSection } from '@/models/schema';

export default function Recipe({
	recipe,
	sections,
	allIngredients,
	recipeIngredients,
	instructions,
}: {
	recipe?: RecipeModel;
	sections?: RecipeSection[];
	allIngredients?: Ingredient[];
	recipeIngredients?: RecipeIngredient[][];
	instructions?: RecipeInstruction[][];
}) {
	const [state, formAction] = useActionState(saveRecipe, null);

	const buttonText = recipe ? 'Save Recipe' : 'Add Recipe';

	return (
		<form action={formAction}>
			<FormField label="Title" name="title" type="text" errors={state?.errors?.title} value={recipe?.title} />

			<FormField label="Author" name="authorId" type="text" errors={state?.errors?.authorId} value={recipe?.authorId} />

			<FormField label="Source" name="source" type="text" errors={state?.errors?.source} value={recipe?.source} />

			<FormField label="Servings" name="servings" type="text" errors={state?.errors?.servings} value={recipe?.servings} />

			<FormField
				label="Prep Time (minutes)"
				name="prepTime"
				type="text"
				errors={state?.errors?.prepTime}
				value={recipe?.prepTime}
			/>

			<FormField
				label="Cook Time (minutes)"
				name="cookTime"
				type="text"
				errors={state?.errors?.cookTime}
				value={recipe?.cookTime}
			/>

			{sections?.map((s, sectionIdx) => {
				const sectionInstructions = instructions ? instructions[sectionIdx] : [];
				const sectionIngredients = recipeIngredients ? recipeIngredients[sectionIdx] : [];
				return (
					<Fragment key={s.id}>
						<fieldset>
							<legend>
								Section <b>{s.title}</b>
							</legend>
							<FormField
								label="Section Title"
								name={`sections.${sectionIdx}.title`}
								type="text"
								value={s.title}
								errors={state?.errors?.[`sections.${sectionIdx}.title`]}
							/>
							<input type="hidden" name={`sections.${sectionIdx}.id`} value={s.id} />
							<h4>Instructions</h4>
							<ol>
								{sectionInstructions.map((inst: RecipeInstruction, instIdx: number) => {
									return (
										<li key={inst.id}>
											<FormField
												label={`${s.order}`}
												name={`instructions.${instIdx}.stepNumber`}
												type="number"
												value={inst.stepNumber}
												errors={state?.errors?.[`instructions.${instIdx}.stepNumber`]}
											/>
											<FormField
												label={`${s.order}`}
												name={`instructions.${instIdx}.instruction`}
												type="textarea"
												value={inst.instruction}
												errors={state?.errors?.[`instructions.${instIdx}.instruction`]}
											/>
											<input type="hidden" name={`instructions.${instIdx}.id`} value={inst.id} />
											<input type="hidden" name={`instructions.${instIdx}.recipeSectionId`} value={s.id} />
										</li>
									);
								})}
								<li>
									<FormField
										label="Step Number"
										name={`instructions.${sectionInstructions.length}.stepNumber`}
										type="number"
										errors={state?.errors?.[`instructions.${sectionInstructions.length}.stepNumber`]}
									/>
									<FormField
										label="New Instruction"
										name={`instructions.${sectionInstructions.length}.instruction`}
										type="textarea"
										errors={state?.errors?.[`instructions.${sectionInstructions.length}.instruction`]}
									/>
									<input type="hidden" name={`instructions.${sectionInstructions.length}.recipeSectionId`} value={s.id} />
								</li>
							</ol>
							<h4>Ingredients</h4>
							<ul>
								{sectionIngredients.map((ing: RecipeIngredient, ingIdx: number) => {
									return (
										<li key={ing.id}>
											<FormField
												label="Order"
												name={`ingredients.${ingIdx}.order`}
												type="text"
												value={ing.order}
												errors={state?.errors?.[`ingredients.${ingIdx}.order`]}
											/>
											<FormField
												label="Quantity"
												name={`ingredients.${ingIdx}.quantity`}
												type="text"
												value={ing.quantity}
												errors={state?.errors?.[`ingredients.${ingIdx}.quantity`]}
											/>
											<FormField
												label="Modifier"
												name={`ingredients.${ingIdx}.modifier`}
												type="text"
												value={ing.modifier}
												errors={state?.errors?.[`ingredients.${ingIdx}.modifier`]}
											/>
											<FormField
												label="Ingredient ID"
												name={`ingredients.${ingIdx}.ingredientId`}
												type="select"
												value={ing.ingredientId}
												required={true}
												errors={state?.errors?.[`ingredients.${ingIdx}.ingredientId`]}
											>
												<option value="" disabled>
													--- select ingredient ---
												</option>
												{allIngredients?.map(ingredient => (
													<option key={ingredient.id} value={ingredient.id}>
														{ingredient.name}
													</option>
												))}
											</FormField>
											<FormField
												label="Preparation"
												name={`ingredients.${ingIdx}.preparation`}
												type="text"
												value={ing.preparation}
												errors={state?.errors?.[`ingredients.${ingIdx}.preparation`]}
											/>
											<input type="hidden" name={`ingredients.${ingIdx}.id`} value={ing.id} />
											<input type="hidden" name={`ingredients.${ingIdx}.recipeSectionId`} value={s.id} />
										</li>
									);
								})}
								<li>
									<FormField
										label="Order"
										name={`ingredients.${sectionIngredients.length}.order`}
										type="text"
										errors={state?.errors?.[`ingredients.${sectionIngredients.length}.order`]}
									/>
									<FormField
										label="Quantity"
										name={`ingredients.${sectionIngredients.length}.quantity`}
										type="text"
										errors={state?.errors?.[`ingredients.${sectionIngredients.length}.quantity`]}
									/>
									<FormField
										label="Modifier"
										name={`ingredients.${sectionIngredients.length}.modifier`}
										type="text"
										errors={state?.errors?.[`ingredients.${sectionIngredients.length}.modifier`]}
									/>
									<FormField
										label="Ingredient ID"
										name={`ingredients.${sectionIngredients.length}.ingredientId`}
										type="select"
										required
										errors={state?.errors?.[`ingredients.${sectionIngredients.length}.ingredientId`]}
									>
										<option>--- select ingredient ---</option>
										{allIngredients?.map(ingredient => (
											<option key={ingredient.id} value={ingredient.id}>
												{ingredient.name}
											</option>
										))}
									</FormField>
									<FormField
										label="Preparation"
										name={`ingredients.${sectionIngredients.length}.preparation`}
										type="text"
										errors={state?.errors?.[`ingredients.${sectionIngredients.length}.preparation`]}
									/>
									<input type="hidden" name={`ingredients.${sectionIngredients.length}.recipeSectionId`} value={s.id} />
								</li>
							</ul>
						</fieldset>
					</Fragment>
				);
			})}

			{state?.errors?._form && <p className="error">{state.errors._form[0]}</p>}

			{state?.success && <p className="success">Recipe saved!</p>}

			{recipe?.id && <input type="hidden" name="id" value={recipe.id} />}

			<button type="submit">{buttonText}</button>
		</form>
	);
}
