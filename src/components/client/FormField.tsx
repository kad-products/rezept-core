type FormFieldProps = {
	label: string;
	name: string;
	type?: 'text' | 'number' | 'email' | 'textarea' | 'select';
	error?: string;
	children?: React.ReactNode; // For select options
	required?: boolean;
};

export default function FormField({
	label,
	name,
	type = 'text',
	error,
	children,
	required = false,
}: FormFieldProps) {
	return (
		<div>
			<label htmlFor={name}>
				{label}
				{required && <span className="required">*</span>}
			</label>

			{type === 'textarea' ? (
				<textarea id={name} name={name} />
			) : type === 'select' ? (
				<select id={name} name={name}>
					{children}
				</select>
			) : (
				<input id={name} type={type} name={name} />
			)}

			{error && <p className="error">{error}</p>}
		</div>
	);
}
