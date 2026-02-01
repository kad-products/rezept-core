import FormFieldWrapper from './FormFieldWrapper';

type FormFieldProps = {
	label: string;
	name: string;
	type?: 'text' | 'number' | 'email' | 'textarea' | 'select';
	error?: string;
	children?: React.ReactNode; // For select options
	required?: boolean;
	value?: string | number | undefined | null;
};

export default function FormField({
	label,
	name,
	type = 'text',
	error,
	children,
	required = false,
	value,
}: FormFieldProps) {
	return (
		<FormFieldWrapper error={error}>
			<label htmlFor={name}>
				{label}
				{required && <span className="required">*</span>}
			</label>

			{type === 'textarea' && <textarea id={name} name={name} defaultValue={value ?? undefined} />}

			{type === 'select' && (
				<select id={name} name={name} defaultValue={value ?? undefined}>
					{children}
				</select>
			)}

			{type !== 'textarea' && type !== 'select' && (
				<input id={name} type={type} name={name} defaultValue={value ?? undefined} />
			)}
		</FormFieldWrapper>
	);
}
