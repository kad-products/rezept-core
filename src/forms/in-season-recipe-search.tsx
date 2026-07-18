'use client';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { submitRecipeSearch } from '@/actions/submit-recipe-search';
import { inSeasonRecipeSearchSchemas } from '@/schemas';
import type { ActionState, InSeasonRecipeSearchFormInput, RecipeDBRead } from '@/types';
import { useAppForm } from './setup/context';
import { FormDevtools } from './setup/FormDevtools';

export default function InSeasonRecipeSearchForm({
	growingZoneOptions,
	monthOptions,
	setResults,
}: {
	growingZoneOptions: { value: string; label: string }[];
	monthOptions: { value: string; label: string }[];
	setResults: (results: RecipeDBRead[]) => void;
}): React.ReactNode {
	const [formState, setFormState] = useState<ActionState<RecipeDBRead[]>>();

	const form = useAppForm({
		formId: 'in-season-recipe-search',
		defaultValues: {
			growingZoneId: '',
			searchMonth: String(new Date().getMonth() + 1),
		},
		validators: {
			onBlur: inSeasonRecipeSearchSchemas.form,
		},
		onSubmit: async ({ value }: { value: InSeasonRecipeSearchFormInput }): Promise<void> => {
			const state = await submitRecipeSearch(value);
			setFormState(state);
			if (state.success && state.data) {
				setResults(state.data);
			}
		},
	});

	return (
		<>
			<Form.Root
				className="rz-form"
				onSubmit={(e: React.FormEvent): void => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				{/* biome-ignore-start lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				<form.AppField name="growingZoneId">
					{(field): React.ReactNode => <field.SelectInput label="Growing Zone" options={growingZoneOptions} required />}
				</form.AppField>
				<form.AppField name="searchMonth">
					{(field): React.ReactNode => <field.SelectInput label="Month" options={monthOptions} required />}
				</form.AppField>
				{/* biome-ignore-end lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
				{formState?.success && <p className="success">Search performed.</p>}
				<form.AppForm>
					<form.SubmitButton label="Search recipes" />
				</form.AppForm>
			</Form.Root>
			<FormDevtools />
		</>
	);
}
