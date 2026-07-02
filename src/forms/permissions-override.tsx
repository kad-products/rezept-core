'use client';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { clearPermissionsOverride, savePermissionsOverride } from '@/actions/permissions';
import permissions from '@/data/permissions';
import { permissionsOverrideSchemas } from '@/schemas';
import type { ActionState, Permission } from '@/types';
import { useAppForm } from './context';
import { FormDevtools } from './FormDevtools';

export default function PermissionsOverrideForm({ currentPermissions }: { currentPermissions: Permission[] }): React.ReactNode {
	const [formState, setFormState] = useState<ActionState<Permission[]>>();

	const form = useAppForm({
		formId: 'permissions-override',
		defaultValues: { permissions: currentPermissions },
		validators: {
			onBlur: permissionsOverrideSchemas.form,
		},
		onSubmit: async ({
			value: formDataObj,
			meta,
		}: {
			value: { permissions: Permission[] };
			meta: { submitAction?: string };
		}): Promise<void> => {
			console.log('Submitting permissions override form', { formDataObj, meta });
			if (meta?.submitAction === 'reset') {
				setFormState(await clearPermissionsOverride());
			} else {
				setFormState(await savePermissionsOverride(formDataObj));
			}
		},
	});

	const permissionsOptions: Array<{ value: string; label: string }> = [];
	for (const [resource, actions] of Object.entries(permissions)) {
		for (const [action] of Object.entries(actions)) {
			permissionsOptions.push({
				label: `${resource}:${action}`,
				value: `${resource}:${action}`,
			});
		}
	}

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
				<form.AppField name="permissions">
					{(field): React.ReactNode => <field.CheckboxGroup label="Permissions" required options={permissionsOptions} />}
				</form.AppField>
				{/* biome-ignore-end lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
				{formState?.success && <p className="success">Permissions override saved!</p>}
				<form.AppForm>
					<form.Submit label="Save Permissions Override" />
					<button type="submit" onClick={(): Promise<void> => form.handleSubmit({ submitAction: 'reset' })}>
						Clear Permissions Override
					</button>
				</form.AppForm>
			</Form.Root>
			<FormDevtools />
		</>
	);
}
