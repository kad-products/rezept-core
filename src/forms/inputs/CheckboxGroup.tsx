'use client';
import { useFieldContext } from '../context';

interface CheckboxGroupProps {
	label: string;
	options: Array<{ value: string; label: string }>;
	required?: boolean;
}

export function CheckboxGroup({ label, options, required = false }: CheckboxGroupProps) {
	const field = useFieldContext<string[]>();
	return (
		<div className="form-field">
			<div className="form-inputs">
				<label htmlFor={field.name}>
					{label}
					{required && <span className="required">*</span>}
				</label>
				{options.map(option => (
					<label key={option.value}>
						<input
							type="checkbox"
							value={option.value}
							checked={field.state.value?.includes(option.value) ?? false}
							onChange={e => {
								if (e.target.checked) {
									field.pushValue(option.value);
								} else {
									field.removeValue(field.state.value?.indexOf(option.value) ?? -1);
								}
							}}
						/>
						{option.label}
					</label>
				))}
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
		</div>
	);
}
