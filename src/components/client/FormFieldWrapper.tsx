import type { FieldError } from 'react-hook-form';

export default function FormFieldWrapper({ error, children }: { error?: FieldError | undefined; children?: React.ReactNode }) {
	return (
		<div className="form-field">
			<div className="form-inputs">{children}</div>

			{error && <div className="form-field-error">{error.message}</div>}
		</div>
	);
}
