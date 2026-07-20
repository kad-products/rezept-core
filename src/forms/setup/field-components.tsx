'use client';
import { Form } from 'radix-ui';
import { RzFormInput } from '@/components/design-system';
import { useFieldContext } from './context';

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
	controlGroup = false,
}: {
	label: string;
	required?: boolean;
	name: string;
	meta: FieldMeta;
	children: React.ReactNode;
	controlGroup?: boolean;
}): React.ReactNode {
	if (controlGroup) {
		return (
			<Form.Field className="rz-form-field" name={name} asChild>
				<fieldset>
					<FieldLabel label={label} required={required} controlGroup={controlGroup} />
					<FieldError isValid={meta.isValid} errors={meta.errors} />
					<Form.Control asChild>{children}</Form.Control>
				</fieldset>
			</Form.Field>
		);
	}
	return (
		<Form.Field className="rz-form-field" name={name}>
			<FieldLabel label={label} required={required} controlGroup={controlGroup} />
			<FieldError isValid={meta.isValid} errors={meta.errors} />
			<Form.Control asChild>{children}</Form.Control>
		</Form.Field>
	);
}

function FieldLabel({
	label,
	required,
	controlGroup,
}: {
	label: string;
	required?: boolean;
	controlGroup?: boolean;
}): React.ReactNode {
	if (controlGroup) {
		return (
			<Form.Label className="rz-form-label" asChild>
				<legend>
					{label}
					{required && <span className="rz-form-input-required">*</span>}
				</legend>
			</Form.Label>
		);
	}
	return (
		<Form.Label className="rz-form-label">
			{label}
			{required && <span className="rz-form-input-required">*</span>}
		</Form.Label>
	);
}

function FieldError({
	isValid,
	errors,
}: {
	isValid: boolean;
	errors: Array<{ code: string; message: string }>;
}): React.ReactNode {
	if (isValid) {
		return null;
	}
	return (
		<div className="rz-form-field-error">
			{errors.map(error => (
				<Form.Message key={error.code} className="rz-form-message" forceMatch={true}>
					{error.message}
				</Form.Message>
			))}
		</div>
	);
}

export function CheckboxGroupInput({
	label,
	required = false,
	options,
}: {
	label: string;
	required?: boolean;
	options: Array<{ value: string; label: string }>;
}): React.ReactNode {
	const field = useFieldContext<string[]>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta} controlGroup>
			<RzFormInput.RzCheckboxGroup
				options={options}
				value={field.state.value}
				onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
					const current = field.state.value ?? [];
					if (e.target.checked) {
						field.handleChange([...current, e.target.value]);
					} else {
						field.handleChange(current.filter(v => v !== e.target.value));
					}
				}}
			/>
		</FieldComponent>
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

export function SelectInput({
	label,
	required = false,
	options,
}: {
	label: string;
	required?: boolean;
	options: Array<{ value: string; label: string }>;
}): React.ReactNode {
	const field = useFieldContext<string>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta}>
			<RzFormInput.RzSelect
				value={field.state.value}
				onChange={(value: string): void => {
					field.handleChange(value);
					field.handleBlur();
				}}
				options={options}
			/>
		</FieldComponent>
	);
}

export function SwitchInput({ label, required = false }: { label: string; required?: boolean }): React.ReactNode {
	const field = useFieldContext<boolean>();
	return (
		<FieldComponent label={label} required={required} name={field.name} meta={field.state.meta}>
			<RzFormInput.RzSwitch checked={field.state.value} onChange={field.handleChange} />
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
