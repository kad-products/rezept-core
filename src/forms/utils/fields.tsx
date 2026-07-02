'use client';
import { Form } from 'radix-ui';
import { RzFormInput } from '@/components/design-system';
import { useFieldContext } from '../context';

type FieldMeta = {
	isValid: boolean;
	errors: Array<{ code: string; message: string }>;
};

function FieldComponent({
	label,
	required = false,
	name,
	meta,
	children,
}: {
	label: string;
	required?: boolean;
	name: string;
	meta: FieldMeta;
	children: React.ReactNode;
}): React.ReactNode {
	return (
		<Form.Field className="rz-form-field" name={name}>
			<Form.Label className="rz-form-label">
				{label}
				{required && <span className="rz-form-input-required">*</span>}
			</Form.Label>
			{!meta.isValid && (
				<div className="rz-form-field-error">
					{meta.errors.map(error => (
						<Form.Message key={error.code} className="rz-form-message" forceMatch={true}>
							{error.message}
						</Form.Message>
					))}
				</div>
			)}
			<Form.Control asChild>{children}</Form.Control>
		</Form.Field>
	);
}

export function DateInput({ label, required = false }: { label: string; required?: boolean }): React.ReactNode {
	const field = useFieldContext<string>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta}>
			<RzFormInput.RzDate
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
			/>
		</FieldComponent>
	);
}
export function TextInput({ label, required = false }: { label: string; required?: boolean }): React.ReactNode {
	const field = useFieldContext<string>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta}>
			<RzFormInput.RzText
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
			/>
		</FieldComponent>
	);
}

export function TextareaInput({ label, required = false }: { label: string; required?: boolean }): React.ReactNode {
	const field = useFieldContext<string>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta}>
			<RzFormInput.RzTextarea
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => field.handleChange(e.target.value)}
			/>
		</FieldComponent>
	);
}

export function NumberInput({ label, required = false }: { label: string; required?: boolean }): React.ReactNode {
	const field = useFieldContext<string>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta}>
			<RzFormInput.RzNumber
				name={field.name}
				value={field.state.value}
				onBlur={field.handleBlur}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => field.handleChange(e.target.value)}
			/>
		</FieldComponent>
	);
}

export function SelectInput<T = string>({
	label,
	required = false,
	options,
}: {
	label: string;
	required?: boolean;
	options: Array<{ value: T; label: string }>;
}): React.ReactNode {
	const field = useFieldContext<string>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta}>
			<RzFormInput.RzSelect value={field.state.value} onChange={field.handleChange} options={options} />
		</FieldComponent>
	);
}
