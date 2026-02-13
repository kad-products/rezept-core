'use client';
import FormFieldWrapper from './FormFieldWrapper';

type FormFieldProps = {
	label: string;
	name: string;
	type?: 'text' | 'number' | 'email' | 'textarea' | 'select';
	error?: string;
	required?: boolean;
	value?: string | number | undefined | null;
	onChange?: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
	onBlur?: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
};

export default function FormField({
	label,
	name,
	type = 'text',
	error,
	required = false,
	value,
	onChange,
	onBlur,
}: FormFieldProps) {
	return (
		<FormFieldWrapper errors={error ? [error] : []}>
			<label htmlFor={name}>
				{label}
				{required && <span className="required">*</span>}
			</label>

			{type === 'textarea' && (
				<textarea id={name} name={name} value={value ?? ''} onChange={onChange} onBlur={onBlur} required={required} />
			)}

			{type !== 'textarea' && type !== 'select' && (
				<input id={name} type={type} name={name} value={value ?? ''} onChange={onChange} onBlur={onBlur} required={required} />
			)}
		</FormFieldWrapper>
	);
}
