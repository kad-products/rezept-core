'use client';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { saveSeason } from '@/actions/seasons';
import type { SeasonalIngredientWithRelations } from '@/repositories/seasonal-ingredients';
import { seasonsSchemas } from '@/schemas';
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
}): React.ReactNode {
	const [formState, setFormState] = useState<ActionState<SeasonFormData>>();

	const schema = season?.id ? seasonsSchemas.update : seasonsSchemas.create;

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
		onSubmit: async ({ value: formDataObj }: { value: SeasonFormData }): Promise<void> => {
			setFormState(await saveSeason(formDataObj));
		},
	});

	const buttonText = season ? 'Save Season' : 'Add Season';

	return (
		<>
			<Form.Root
				className="rz-form"
				onSubmit={(e: React.FormEvent): void => {
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
				{/* biome-ignore-start lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				<form.AppField name="name">{(field): React.ReactNode => <field.TextInput label="Name" required />}</form.AppField>
				<form.AppField name="description">
					{(field): React.ReactNode => <field.TextareaInput label="Description" required />}
				</form.AppField>
				<form.AppField name="country">
					{(field): React.ReactNode => <field.Select label="Country" options={countryOptions} required />}
				</form.AppField>
				<form.AppField name="region">{(field): React.ReactNode => <field.TextInput label="Region" required />}</form.AppField>
				<form.AppField name="startMonth">
					{(field): React.ReactNode => <field.Select<number> label="Start Month" options={monthOptions} required />}
				</form.AppField>
				<form.AppField name="endMonth">
					{(field): React.ReactNode => <field.Select<number> label="End Month" options={monthOptions} required />}
				</form.AppField>
				<form.AppField name="notes">{(field): React.ReactNode => <field.TextareaInput label="Notes" />}</form.AppField>
				<form.AppField name="ingredients">
					{(field): React.ReactNode => <field.CheckboxGroup label="Ingredients" required options={ingredientOptions} />}
				</form.AppField>
				{/* biome-ignore-end lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
				{formState?.success && <p className="success">Season saved!</p>}
				<form.AppForm>
					<form.Submit label={buttonText} />
				</form.AppForm>
				<form.Subscribe
					key={form.state.submissionAttempts} // Force re-render on each attempt
					selector={(state: { errors: unknown[]; submissionAttempts: number }): { errors: unknown[]; attempts: number } => ({
						errors: state.errors,
						attempts: state.submissionAttempts,
					})}
				>
					{(state: { errors: unknown[]; attempts: number }): React.ReactNode => (
						<div>
							<pre>Submission Attempts: {state.attempts}</pre>
							<pre>Errors: {JSON.stringify(state.errors, null, 2)}</pre>
						</div>
					)}
				</form.Subscribe>
			</Form.Root>
			{import.meta.env.DEV && <TanStackDevtools plugins={[formDevtoolsPlugin()]} />}
		</>
	);
}
