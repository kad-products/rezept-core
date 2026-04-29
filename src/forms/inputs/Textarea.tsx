'use client';
import { Form } from 'radix-ui';
import { useFieldContext } from '../context';

export function TextareaInput({ label, required = false }: { label: string; required?: boolean }): React.ReactNode {
	const field = useFieldContext<string>();
	return (
		<Form.Field className="rz-form-field" name={field.name}>
			<Form.Label className="rz-form-label">
				{label}
				{required && <span className="rz-form-input-required">*</span>}
			</Form.Label>
			{!field.state.meta.isValid && (
				<div className="rz-form-field-error">
					{field.state.meta.errors.map(error => (
						<Form.Message key={error.code} className="rz-form-message" forceMatch={true}>
							{error.message}
						</Form.Message>
					))}
				</div>
			)}
			<Form.Control asChild>
				<textarea
					id={field.name}
					name={field.name}
					value={field.state.value ?? ''}
					onBlur={field.handleBlur}
					onChange={(e: React.ChangeEvent<HTMLTextAreaElement>): void => field.handleChange(e.target.value)}
				/>
			</Form.Control>
		</Form.Field>
	);
}
