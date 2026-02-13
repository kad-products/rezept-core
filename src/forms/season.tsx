'use client';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import { useState } from 'react';
import Select from 'react-select';
import { z } from 'zod';
import FormField from '@/components/client/FormFieldMantine';
import FormFieldWrapper from '@/components/client/FormFieldWrapper';
import { saveSeason } from '@/functions/seasons';
import type { Ingredient } from '@/models/ingredients';
import type { SeasonalIngredientWithRelations } from '@/repositories/seasonal-ingredients';

const schema = z.object({
	id: z.string().optional(),
	name: z.string().min(1, 'Name is required'),
	description: z.string().optional(),
	country: z.string(),
	region: z.string(),
	startMonth: z.number(),
	endMonth: z.number(),
	notes: z.string(),
	ingredients: z.array(z.string()), // array of ingredient IDs
});

// const zodResolver = (schema: z.ZodSchema) => (values: any) => {
// 	const result = schema.safeParse(values);

// 	if (result.success) {
// 		return {};
// 	}

// 	// Zod v4 - errors are directly on result.error.issues
// 	const errors: Record<string, string> = {};
// 	result.error.issues.forEach(issue => {
// 		const path = issue.path.join('.');
// 		errors[path] = issue.message;
// 	});

// 	return errors;
// };

const userLocale = navigator.language; // 'en-US', 'nb-NO', etc.
const monthNames = Array.from({ length: 12 }, (_, i) => {
	const date = new Date(2000, i, 1);
	return {
		name: new Intl.DateTimeFormat(userLocale, { month: 'long' }).format(date),
		code: i + 1,
	};
});

type ActionState = {
	success: boolean | undefined;
	errors?: Record<string, string[]>;
} | null;

type SeasonFormData = {
	name: string;
	id?: string | undefined;
	description?: string | undefined | null;
	country: string;
	region?: string | null;
	startMonth: number;
	endMonth: number;
	notes?: string | null;
	ingredients: string[];
};

export default function Season({
	season,
	ingredients,
	seasonalIngredients,
	countries,
}: {
	season?: Omit<SeasonFormData, 'ingredients'>;
	ingredients: Ingredient[];
	seasonalIngredients?: SeasonalIngredientWithRelations[];
	countries: { code: string; name: string }[];
}) {
	const [serverActionResult, setServerActionResult] = useState<ActionState>({
		success: undefined,
	});

	const form = useForm({
		initialValues: season
			? {
					...season,
					ingredients: seasonalIngredients?.map(si => si.ingredientId) || [],
				}
			: ({} as SeasonFormData),
		validate: zod4Resolver(schema),
	});

	console.log(schema.safeParse(form.getValues()));
	console.log(`Form errors: ${JSON.stringify(form.errors)}`);

	const onSubmit = async (data: SeasonFormData) => {
		console.log(data);
		console.log(schema.safeParse(data));

		form.validate();
		form.errors;

		const result = await saveSeason(data);
		if (!result?.success) {
			if (result?.errors?._form) {
				form.setErrors({ form: result?.errors?._form[0] });
			}
		}
		setServerActionResult(result);
	};

	const buttonText = season ? 'Save Season' : 'Add Season';

	const ingredientOptions = ingredients.map(i => ({
		value: i.id,
		label: i.name,
	}));

	const countryOptions = countries.map(c => ({
		value: c.code,
		label: c.name,
	}));

	const monthOptions = monthNames.map(m => ({
		value: m.code,
		label: m.name,
	}));

	return (
		<form onSubmit={form.onSubmit(onSubmit)}>
			<FormField label="Name" name="name" {...form.getInputProps('name')} />

			<FormField label="Description" name="description" type="textarea" {...form.getInputProps('description')} />

			<FormFieldWrapper {...form.getInputProps('country')}>
				<label htmlFor="country">
					Country
					<span className="required">*</span>
				</label>
				<Select
					{...form.getInputProps('country')}
					instanceId="season-country-select"
					options={countryOptions}
					value={countryOptions.find(c => c.value === form.values.country)}
					onChange={option => form.setFieldValue('country', option?.value || '')}
				/>
			</FormFieldWrapper>

			<FormField label="Region" name="region" {...form.getInputProps('region')} />

			<FormFieldWrapper {...form.getInputProps('startMonth')}>
				<label htmlFor="startMonth">
					Start Month
					<span className="required">*</span>
				</label>
				<Select
					{...form.getInputProps('startMonth')}
					instanceId="season-start-month-select"
					options={monthOptions}
					value={monthOptions.find(c => c.value === form.values.startMonth)}
					onChange={option => form.setFieldValue('startMonth', option?.value || '')}
				/>
			</FormFieldWrapper>

			<FormFieldWrapper {...form.getInputProps('endMonth')}>
				<label htmlFor="endMonth">
					End Month
					<span className="required">*</span>
				</label>
				<Select
					{...form.getInputProps('endMonth')}
					instanceId="season-end-month-select"
					options={monthOptions}
					value={monthOptions.find(c => c.value === form.values.endMonth)}
					onChange={option => form.setFieldValue('endMonth', option?.value || '')}
				/>
			</FormFieldWrapper>

			<FormField label="Notes" name="notes" type="textarea" key={form.key('notes')} {...form.getInputProps('notes')} />

			<FormFieldWrapper {...form.getInputProps('ingredients')}>
				{ingredientOptions.map(ingredient => (
					<label key={ingredient.value}>
						<input
							type="checkbox"
							checked={form.values.ingredients?.includes(ingredient.value) ?? false}
							onChange={e => {
								const current = form.values.ingredients || [];
								const newValue = e.target.checked
									? [...current, ingredient.value]
									: current.filter(id => id !== ingredient.value);
								form.setFieldValue('ingredients', newValue);
							}}
						/>
						{ingredient.label}
					</label>
				))}
			</FormFieldWrapper>

			{serverActionResult?.errors && <p className="error">{JSON.stringify(serverActionResult?.errors, null, 4)}</p>}

			{serverActionResult?.success && <p className="success">Season saved!</p>}

			<button type="submit">{buttonText}</button>
		</form>
	);
}
