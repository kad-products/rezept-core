'use client';
import { useFieldContext } from './context';

export function TextareaInput({ label, required = false }: { label: string; required?: boolean }) {
	const field = useFieldContext<string>();
	return (
		<div className="form-field">
			<div className="form-inputs">
				<label htmlFor={field.name}>
					{label}
					{required && <span className="required">*</span>}
				</label>
				<textarea
					id={field.name}
					name={field.name}
					value={field.state.value}
					required={required}
					onChange={e => field.handleChange(e.target.value)}
				/>
				{!field.state.meta.isValid && (
					<div className="form-field-error">
						{field.state.meta.errors.map(error => (
							<p key={error} className="error">
								{error}
							</p>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
