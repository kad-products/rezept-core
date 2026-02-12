'use client';
import ReactSelect from 'react-select';
import { useFieldContext } from './context';

interface SelectProps<T = string> {
	label: string;
	options: Array<{ value: T; label: string }>;
	required?: boolean;
}

export function Select<T = string>({ label, options, required }: SelectProps<T>) {
	const field = useFieldContext<T>();

	return (
		<div className="form-field">
			<div className="form-inputs">
				<label htmlFor={field.name}>
					{label}
					{required && <span className="required">*</span>}
				</label>
				<ReactSelect
					instanceId={`${field.name}-select`}
					name={field.name}
					options={options}
					value={options.find(opt => opt.value === field.state.value)}
					onChange={selected => field.handleChange(selected?.value as T)}
					onBlur={field.handleBlur}
				/>
			</div>
			{!field.state.meta.isValid && (
				<div className="form-field-error">
					{field.state.meta.errors.map(error => (
						<p key={error.code} className="error">
							{error.message}
						</p>
					))}
				</div>
			)}
		</div>
	);
}
