import FormFieldWrapper from './FormFieldWrapper';

type FormFieldProps = {
	label: string;
	name: string;
	type?: 'text' | 'number' | 'email' | 'textarea' | 'select';
	errors?: string[] | undefined;
	children?: React.ReactNode; // For select options
	required?: boolean;
	value?: string | number | undefined | null;
};

export default function FormField({
	label,
	name,
	type = 'text',
	errors,
	children,
	required = false,
	value,
}: FormFieldProps) {
	return (
		<FormFieldWrapper errors={errors}>
			<label htmlFor={name}>
				{label}
				{required && <span className="required">*</span>}
			</label>

			{type === 'textarea' && (
				<textarea id={name} name={name} defaultValue={value ?? undefined} required={required} />
			)}

			{type === 'select' && (
				<select id={name} name={name} defaultValue={value ?? undefined} required={required}>
					{children}
				</select>
			)}

			{type !== 'textarea' && type !== 'select' && (
				<input
					id={name}
					type={type}
					name={name}
					defaultValue={value ?? undefined}
					required={required}
				/>
			)}
		</FormFieldWrapper>
	);
}
