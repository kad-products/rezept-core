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
			onBlur: schema,
		},
		onSubmit: async ({ value: formDataObj }) => {
			setFormState(await saveSeason(formDataObj));
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
