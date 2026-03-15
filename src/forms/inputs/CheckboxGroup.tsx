'use client';
import { Form } from 'radix-ui';
import { useFieldContext } from '../context';

interface CheckboxGroupProps {
	label: string;
	options: Array<{ value: string; label: string }>;
	required?: boolean;
}

export function CheckboxGroup({ label, options, required = false }: CheckboxGroupProps) {
	const field = useFieldContext<string[]>();
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
			<div className="rz-form-field-controls rz-form-field-controls-checkboxes">
				{options.map(option => (
					<Form.Control key={option.value} asChild>
						<label>
							<input
								type="checkbox"
								value={option.value}
								checked={field.state.value?.includes(option.value) ?? false}
								onBlur={field.handleBlur}
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
					</Form.Control>
				))}
			</div>
		</Form.Field>
	);
}
