'use client';
import type { FieldError, UseFormRegisterReturn } from 'react-hook-form';
import FormFieldWrapper from './FormFieldWrapper';

type FormFieldProps = {
	label: string;
	type?: 'text' | 'number' | 'email' | 'textarea' | 'select';
	error?: FieldError;
	value?: string | number | undefined | null;
	register: UseFormRegisterReturn;
};

export default function FormField({ label, type = 'text', error, value, register }: FormFieldProps) {
	return (
		<FormFieldWrapper error={error}>
			<label htmlFor={register.name}>
				{label}
				{register.required && <span className="required">*</span>}
			</label>

			{type === 'textarea' && <textarea defaultValue={value ?? undefined} {...register} />}

			{type !== 'textarea' && type !== 'select' && <input type={type} defaultValue={value ?? undefined} {...register} />}
		</FormFieldWrapper>
	);
}
