'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import Select from 'react-select';
import { z } from 'zod';
import FormField from '@/components/client/FormField';
import FormFieldWrapper from '@/components/client/FormFieldWrapper';
import { saveSeason } from '@/functions/seasons';
import type { Ingredient } from '@/models/ingredients';
import type { Season as SeasonModel } from '@/models/seasons';
import type { SeasonalIngredientWithRelations } from '@/repositories/seasonal-ingredients';

const schema = z.object({
	id: z.string().optional(),
	name: z.string(),
	description: z.string().optional(),
	country: z.string(),
	region: z.string(),
	startMonth: z.number(),
	endMonth: z.number(),
	notes: z.string(),
	ingredients: z.array(z.string()), // array of ingredient IDs
});

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
	description?: string | undefined;
	country: string;
	region: string;
	startMonth: number;
	endMonth: number;
	notes: string;
	ingredients: string[];
};

export default function Season({
	season,
	ingredients,
	seasonalIngredients,
	countries,
}: {
	season?: SeasonModel;
	ingredients: Ingredient[];
	seasonalIngredients?: SeasonalIngredientWithRelations[];
	countries: { code: string; name: string }[];
}) {
	const [serverActionResult, setServerActionResult] = useState<ActionState>({
		success: undefined,
	});

	const {
		control,
		register,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm({
		resolver: zodResolver(schema),
		defaultValues: season
			? {
					id: season.id,
					name: season.name,
					country: season.country,
					startMonth: season.startMonth,
					endMonth: season.endMonth,
					ingredients: seasonalIngredients?.map(si => si.ingredientId),
				}
			: {},
	});

	const onSubmit = async (data: SeasonFormData) => {
		const result = await saveSeason(data);
		if (!result?.success) {
			if (result?.errors?._form) {
				setError('root.form', {
					type: 'server',
					message: result?.errors?._form[0],
				});
			}
		}
		setServerActionResult(result);
	};

	const buttonText = season ? 'Save Season' : 'Add Season';

	const countryOptions = countries.map(c => ({
		value: c.code,
		label: c.name,
	}));

	const monthOptions = monthNames.map(m => ({
		value: m.code,
		label: m.name,
	}));

	return (
		<form onSubmit={handleSubmit(onSubmit)}>
			<FormField label="Name" type="text" error={errors?.name} value={season?.name} register={register('name')} />

			<FormFieldWrapper error={errors?.country}>
				<label htmlFor="country">
					Country
					<span className="required">*</span>
				</label>
				<Controller
					name="country"
					control={control}
					render={({ field }) => {
						return (
							<Select
								{...field}
								instanceId="season-country-select"
								value={countryOptions.find(c => c.value === field.value)}
								options={countryOptions}
								onChange={val => {
									console.log(`Value: ${val?.value}`);
									field.onChange(val?.value); // ← ADD THIS - actually update the form
								}}
							/>
						);
					}}
				/>
			</FormFieldWrapper>

			<FormField label="Region" type="text" error={errors?.region} value={season?.region} register={register('region')} />

			<FormFieldWrapper error={errors?.startMonth}>
				<label htmlFor="startMonth">
					Start Month
					<span className="required">*</span>
				</label>
				<Controller
					name="startMonth"
					control={control}
					render={({ field }) => {
						return (
							<Select
								{...field}
								instanceId="season-start-month-select"
								value={monthOptions.find(m => m.value === field.value)}
								options={monthOptions}
								onChange={val => {
									field.onChange(val?.value);
								}}
							/>
						);
					}}
				/>
			</FormFieldWrapper>

			<FormFieldWrapper error={errors?.endMonth}>
				<label htmlFor="endMonth">
					End Month
					<span className="required">*</span>
				</label>
				<Controller
					name="endMonth"
					control={control}
					render={({ field }) => {
						return (
							<Select
								{...field}
								instanceId="season-end-month-select"
								value={monthOptions.find(m => m.value === field.value)}
								options={monthOptions}
								onChange={val => {
									console.log(`Value: ${val?.value}`);
									field.onChange(val?.value); // ← ADD THIS - actually update the form
								}}
							/>
						);
					}}
				/>
			</FormFieldWrapper>

			<FormField
				label="Description"
				type="textarea"
				error={errors?.description}
				value={season?.description}
				register={register('description')}
			/>

			<FormField label="Notes" type="textarea" error={errors?.notes} value={season?.notes} register={register('notes')} />

			<FormFieldWrapper
				error={
					errors.ingredients
						? {
								type: 'validation',
								message: errors.ingredients.message ?? 'Invalid ingredients',
							}
						: undefined
				}
			>
				<Controller
					name="ingredients"
					control={control}
					render={({ field }) => (
						<>
							{ingredients.map(ingredient => (
								<label key={ingredient.id}>
									<input
										type="checkbox"
										value={ingredient.id}
										checked={field.value?.includes(ingredient.id) ?? false}
										onChange={e => {
											const newValue = e.target.checked
												? [...(field.value || []), ingredient.id]
												: (field.value || []).filter(id => id !== ingredient.id);
											console.log(e.target);
											field.onChange(newValue);
										}}
									/>
									{ingredient.name}
								</label>
							))}
						</>
					)}
				/>
			</FormFieldWrapper>

			{serverActionResult?.errors && <p className="error">{JSON.stringify(serverActionResult?.errors, null, 4)}</p>}

			{serverActionResult?.success && <p className="success">Season saved!</p>}

			{season?.id && <input type="hidden" name="id" value={season.id} />}

			<button type="submit">{buttonText}</button>
		</form>
	);
}
