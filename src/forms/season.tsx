'use client';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { useState } from 'react';
import { saveSeason } from '@/actions/seasons';
import type { SeasonalIngredientWithRelations } from '@/repositories/seasonal-ingredients';
import { createSeasonSchema, updateSeasonSchema } from '@/schemas';
import type { ActionState, Season as SeasonModel } from '@/types';
import { useAppForm } from './context';

type SeasonFormData = {
	name: string;
	id?: string | undefined;
	description?: string | undefined | null;
	country: string;
	region?: string | null;
	startMonth: number;
	endMonth: number;
	notes?: string | null;
	ingredients?: string[];
};

export default function Season({
	season,
	ingredientOptions,
	seasonalIngredients,
	countryOptions,
	monthOptions,
}: {
	season?: SeasonModel;
	ingredientOptions: { value: string; label: string }[];
	seasonalIngredients?: SeasonalIngredientWithRelations[];
	countryOptions: { value: string; label: string }[];
	monthOptions: { value: number; label: string }[];
}) {
	const [formState, setFormState] = useState<ActionState<SeasonFormData>>();

	const schema = season?.id ? updateSeasonSchema : createSeasonSchema;

	const form = useAppForm({
		defaultValues: season
			? {
					...season,
					ingredients: seasonalIngredients?.map(si => si.ingredientId) || [],
				}
			: ({} as SeasonFormData),
		validators: {
			onSubmit: schema,
		},
		onSubmit: async ({ value: formDataObj }) => {
			console.log(`In submit handler`, formDataObj);
			const results = await saveSeason(formDataObj);
			console.log(results);
			setFormState(results);
		},
		onSubmitInvalid: ({ value, formApi }) => {
			console.log('=== VALIDATION FAILED ===');
			console.log('Submitted values:', value);
			console.log('Form errors:', formApi.state.errors);
			console.log('Field meta:', formApi.state.fieldMeta);

			// Force update to show errors in UI
			// formApi.store.setState(prev => ({ ...prev }));
		},
	});

	const buttonText = season ? 'Save Season' : 'Add Season';

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
				<div className="border-2 border-red-500 p-4 mb-4">
					<h3>Debug Info</h3>
					<p>Can Submit: {String(form.state.canSubmit)}</p>
					<p>Is Valid: {String(form.state.isValid)}</p>
					<p>Submission Attempts: {form.state.submissionAttempts}</p>
					<details>
						<summary>All State</summary>
						<pre>
							{JSON.stringify(
								{
									errors: form.state.errors,
									values: form.state.values,
									fieldMeta: form.state.fieldMeta,
								},
								null,
								2,
							)}
						</pre>
					</details>
				</div>
				{form.state.submissionAttempts > 0 && !form.state.isValid && (
					<div className="bg-red-100 border border-red-500 p-4 mb-4">
						<h3>Validation Errors:</h3>
						<pre>{JSON.stringify(form.state.errors, null, 2)}</pre>
					</div>
				)}
				<pre>{JSON.stringify(form.state, null, 2)}</pre>
				<hr />
				{JSON.stringify(form.getAllErrors())}
				<hr />
				{JSON.stringify(formState)}
				<form.AppField name="name">{field => <field.TextInput label="Name" required />}</form.AppField>

				<form.AppField name="description">{field => <field.TextareaInput label="Description" required />}</form.AppField>

				<form.AppField name="country">
					{field => <field.Select label="Country" options={countryOptions} required />}
				</form.AppField>

				<form.AppField name="region">{field => <field.TextInput label="Region" required />}</form.AppField>

				<form.AppField name="startMonth">
					{field => <field.Select<number> label="Start Month" options={monthOptions} required />}
				</form.AppField>

				<form.AppField name="endMonth">
					{field => <field.Select<number> label="End Month" options={monthOptions} required />}
				</form.AppField>

				<form.AppField name="notes">{field => <field.TextareaInput label="Notes" />}</form.AppField>

				<form.AppField name="ingredients">
					{field => <field.CheckboxGroup label="Ingredients" required options={ingredientOptions} />}
				</form.AppField>

				{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}

				{formState?.success && <p className="success">Season saved!</p>}

				{formState?.errors && <p className="error">{JSON.stringify(formState?.errors, null, 4)}</p>}

				{formState?.success && <p className="success">Season saved!</p>}

				<form.AppForm>
					<form.Submit label={buttonText} />
				</form.AppForm>
			</form>
			<TanStackDevtools plugins={[formDevtoolsPlugin()]} />
		</>
	);
}
