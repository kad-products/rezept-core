'use client';
import { useTransition } from 'react';
import Select, { type GroupBase } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import { addIngredient } from '@/actions/ingredients';
import FormFieldWrapper from './FormFieldWrapper';

type SelectOption = {
	value: string | number;
	label: string;
};

type FormFieldProps = {
	label: string;
	name: string;
	type?: 'text' | 'number' | 'email' | 'textarea' | 'select';
	errors?: string[] | undefined;
	required?: boolean;
	value?: string | number | undefined | null;
	options?: SelectOption[];
	optionGroups?: GroupBase<SelectOption>[];
	creatable?: boolean;
};

export default function FormField({
	label,
	name,
	type = 'text',
	errors,
	options,
	optionGroups,
	creatable = false,
	required = false,
	value,
}: FormFieldProps) {
	const [isPending, startTransition] = useTransition();

	const createIngredient = async (ingredientName: string) => {
		await addIngredient(ingredientName);
	};

	const handleCreate = (inputValue: string) => {
		console.log(inputValue);
		startTransition(() => void createIngredient(inputValue));
	};

	return (
		<FormFieldWrapper errors={errors}>
			<label htmlFor={name}>
				{label}
				{required && <span className="required">*</span>}
			</label>

			{type === 'textarea' && <textarea id={name} name={name} defaultValue={value ?? undefined} required={required} />}

			{type === 'select' &&
				!creatable &&
				(isPending ? (
					<p>Is pending</p>
				) : (
					<Select
						id={name}
						name={name}
						defaultValue={(options || optionGroups?.flatMap(g => g.options))?.find(o => o.value === value)}
						options={optionGroups || options}
						required={required}
					/>
				))}

			{type === 'select' && creatable && (
				<CreatableSelect
					id={name}
					name={name}
					defaultValue={(options || optionGroups?.flatMap(g => g.options))?.find(o => o.value === value)}
					options={optionGroups || options}
					required={required}
					onCreateOption={handleCreate}
				/>
			)}

			{type !== 'textarea' && type !== 'select' && (
				<input id={name} type={type} name={name} defaultValue={value ?? undefined} required={required} />
			)}
		</FormFieldWrapper>
	);
}
