'use client';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { useState } from 'react';
import { saveRecipe } from '@/actions/recipes';
import { recipeFormSchema } from '@/schemas';
import type { ActionState, Ingredient, RecipeFormData, RecipeWithSections } from '@/types';
import { useAppForm } from './context';

export default function Recipe({
	recipe,
	allIngredients,
	currentUserId,
}: {
	recipe?: RecipeWithSections;
	allIngredients?: Ingredient[];
	currentUserId: string | undefined;
}) {
	const [formState, setFormState] = useState<ActionState<RecipeFormData>>();

	const newRecipeDefaults = {
		title: '',
		sections: [],
		authorId: currentUserId,
	};

	const form = useAppForm({
		formId: 'recipe',
		defaultValues: (recipe ? recipe : newRecipeDefaults) as RecipeFormData,
		validators: {
			onBlur({ value }) {
				// having to do this manually because typescript didn't like the signature of recipeFormSchema
				// and the type it expected/returned compared to the shape of the form data
				console.log(`Form values: ${JSON.stringify(value, null, 4)}`);
				const results = recipeFormSchema.safeParse(value);
				console.log(`Schema results: ${JSON.stringify(results, null, 4)}`);
				if (results.success) {
					return undefined;
				}
			},
		},
		onSubmit: async ({ value: formDataObj }) => {
			setFormState(await saveRecipe(formDataObj));
		},
	});

	const buttonText = recipe ? 'Save Recipe' : 'Add Recipe';

	return (
		<>
			<form
				onSubmit={e => {
					console.log(`Trying to submit the form`);
					e.preventDefault();
					e.stopPropagation();
					console.log(`About to hit the go button`);

					console.log('=== PRE-SUBMISSION STATE ===');
					console.log('canSubmit:', form.state.canSubmit);
					console.log('isValid:', form.state.isValid);
					console.log('Errors:', form.state.errors);
					console.log('Values:', form.state.values);
					console.log('Submission attempts:', form.state.submissionAttempts);
					form.handleSubmit();
				}}
			>
				<form.AppField name="title">{field => <field.TextInput label="Title" required />}</form.AppField>
				<form.AppField name="authorId">{field => <field.TextInput label="Author" required />}</form.AppField>
				<form.AppField name="source">{field => <field.TextInput label="Source" />}</form.AppField>
				<form.AppField name="servings">{field => <field.TextInput label="Servings" />}</form.AppField>
				<form.AppField name="prepTime">{field => <field.TextInput label="Prep Time (minutes)" />}</form.AppField>
				<form.AppField name="cookTime">{field => <field.TextInput label="Cook Time (minutes)" />}</form.AppField>

				<form.Field name="sections" mode="array">
					{sectionsField => (
						<div>
							{sectionsField.state.value?.map((section, i) => (
								<fieldset key={section.id || `new-${i}`}>
									<form.AppField name={`sections[${i}].title`}>
										{titleField => (
											<>
												<legend>
													Section <b>{titleField.state.value || 'Untitled'}</b>
												</legend>
												<titleField.TextInput label="Section Title" />
											</>
										)}
									</form.AppField>

									<form.AppField name={`sections[${i}].order`}>{field => <field.NumberInput label="Order" />}</form.AppField>

									<h4>Instructions</h4>
									<form.Field name={`sections[${i}].instructions`} mode="array">
										{instructionsField => (
											<div>
												<ol>
													{instructionsField.state.value?.map((instruction, instIdx) => (
														<li key={instruction.id || `new-inst-${instIdx}`}>
															<form.AppField name={`sections[${i}].instructions[${instIdx}].stepNumber`}>
																{field => <field.NumberInput label="Step Number" />}
															</form.AppField>

															<form.AppField name={`sections[${i}].instructions[${instIdx}].instruction`}>
																{field => <field.TextareaInput label="Instruction" />}
															</form.AppField>

															<button type="button" onClick={() => instructionsField.removeValue(instIdx)}>
																Remove Step
															</button>
														</li>
													))}
												</ol>

												<button
													type="button"
													onClick={() =>
														instructionsField.pushValue({
															stepNumber: instructionsField.state.value ? instructionsField.state.value.length + 1 : 1,
															instruction: '',
														})
													}
												>
													Add Instruction
												</button>
											</div>
										)}
									</form.Field>

									<h4>Ingredients</h4>
									<form.Field name={`sections[${i}].ingredients`} mode="array">
										{ingredientsField => (
											<div>
												<ul>
													{ingredientsField.state.value?.map((ingredient, ingIdx) => (
														<li key={ingredient.id || `new-ing-${ingIdx}`}>
															<form.AppField name={`sections[${i}].ingredients[${ingIdx}].order`}>
																{field => <field.NumberInput label="Order" />}
															</form.AppField>

															<form.AppField name={`sections[${i}].ingredients[${ingIdx}].quantity`}>
																{field => <field.NumberInput label="Quantity" />}
															</form.AppField>

															<form.AppField name={`sections[${i}].ingredients[${ingIdx}].modifier`}>
																{field => <field.TextInput label="Modifier" />}
															</form.AppField>

															<form.AppField name={`sections[${i}].ingredients[${ingIdx}].ingredientId`}>
																{field => (
																	<field.Select
																		label="Ingredient"
																		required
																		options={[
																			{ value: '', label: '--- select ingredient ---' },
																			...(allIngredients?.map(ing => ({
																				value: ing.id,
																				label: ing.name,
																			})) || []),
																		]}
																	/>
																)}
															</form.AppField>

															<form.AppField name={`sections[${i}].ingredients[${ingIdx}].preparation`}>
																{field => <field.TextInput label="Preparation" />}
															</form.AppField>

															<button type="button" onClick={() => ingredientsField.removeValue(ingIdx)}>
																Remove Ingredient
															</button>
														</li>
													))}
												</ul>

												<button
													type="button"
													onClick={() =>
														ingredientsField.pushValue({
															quantity: 1,
															order: ingredientsField.state.value ? ingredientsField.state.value.length : 0,
															ingredientId: '',
														})
													}
												>
													Add Ingredient
												</button>
											</div>
										)}
									</form.Field>

									<button type="button" onClick={() => sectionsField.removeValue(i)}>
										Remove Section
									</button>
								</fieldset>
							))}

							<button
								type="button"
								onClick={() =>
									sectionsField.pushValue({
										title: '',
										order: sectionsField.state.value ? sectionsField.state.value.length : 0,
										ingredients: [],
										instructions: [],
									})
								}
							>
								Add Section
							</button>
						</div>
					)}
				</form.Field>
				{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
				{formState?.success && <p className="success">Season saved!</p>}
				<form.AppForm>
					<form.Submit label={buttonText} />
				</form.AppForm>
				<form.Subscribe
					key={form.state.submissionAttempts} // Force re-render on each attempt
					selector={state => ({
						errors: state.errors,
						attempts: state.submissionAttempts,
					})}
				>
					{state => (
						<div>
							<pre>Submission Attempts: {state.attempts}</pre>
							<pre>Errors: {JSON.stringify(state.errors, null, 2)}</pre>
						</div>
					)}
				</form.Subscribe>
			</form>
			<TanStackDevtools plugins={[formDevtoolsPlugin()]} />
		</>
	);
}
