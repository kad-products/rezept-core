'use client';
import { useFieldContext } from '../context';

export function NumberInput({ label, required = false }: { label: string; required?: boolean }) {
	const field = useFieldContext<string>();
	return (
		<div className="form-field">
			<div className="form-inputs">
				<label htmlFor={field.name}>
					{label}
					{required && <span className="required">*</span>}
				</label>
				<input
					id={field.name}
					type="number"
					name={field.name}
					value={field.state.value}
					onBlur={field.handleBlur}
					onChange={e => field.handleChange(e.target.value)}
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
