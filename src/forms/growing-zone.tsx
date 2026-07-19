'use client';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { saveGrowingZone } from '@/actions/growing-zone';
import { growingZonesSchemas } from '@/schemas';
import type { ActionState, GrowingZoneDBRead, GrowingZoneFormInput } from '@/types';
import { useAppForm } from './setup/context';
import { FormDevtools } from './setup/FormDevtools';

export default function GrowingZoneForm({ growingZone }: { growingZone: GrowingZoneFormInput }): React.ReactNode {
	const [formState, setFormState] = useState<ActionState<GrowingZoneDBRead>>();

	const form = useAppForm({
		formId: 'growing-zone',
		defaultValues: growingZone,
		validators: {
			onBlur: growingZonesSchemas.form,
		},
		onSubmit: async ({ value }: { value: GrowingZoneFormInput }): Promise<void> => {
			setFormState(await saveGrowingZone(value));
		},
	});

	return (
		<>
			<Form.Root
				className="rz-form"
				onSubmit={(e: React.FormEvent): void => {
					e.preventDefault();
					e.stopPropagation();
					form.handleSubmit();
				}}
			>
				{/* biome-ignore-start lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				<form.AppField name="name">{(field): React.ReactNode => <field.TextInput label="Name" required />}</form.AppField>
				<form.AppField name="code">{(field): React.ReactNode => <field.TextInput label="Code" required />}</form.AppField>
				{/* biome-ignore-end lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
				{formState?.success && <p className="success">Growing Zone saved.</p>}
				<form.AppForm>
					<form.SubmitButton label="Save Growing Zone" />
				</form.AppForm>
			</Form.Root>
			<FormDevtools />
		</>
	);
}
