'use client';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { saveApiKey } from '@/actions/api-keys';
import permissions from '@/data/permissions';
import { apiKeysSchemas } from '@/schemas';
import type { ActionState, ApiKeyDBRead, ApiKeyFormInput } from '@/types';
import { useAppForm } from './context';
import { FormDevtools } from './FormDevtools';

export default function ApiKeyForm({
	apiKey,
	currentUserId,
}: {
	apiKey?: ApiKeyDBRead;
	currentUserId: string | undefined;
}): React.ReactNode {
	const [formState, setFormState] = useState<ActionState<ApiKeyDBRead>>();

	const newApiKeyDefaults = {
		permissions: [],
		userId: currentUserId,
	};

	const form = useAppForm({
		formId: 'api-key',
		defaultValues: (apiKey ? apiKey : newApiKeyDefaults) as ApiKeyFormInput,
		validators: {
			onBlur: apiKeysSchemas.form,
		},
		onSubmit: async ({ value: formDataObj }: { value: ApiKeyFormInput }): Promise<void> => {
			setFormState(await saveApiKey(formDataObj));
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

	const buttonText = apiKey ? 'Save API Key' : 'Create API Key';

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
				<form.AppField name="revokeAt">
					{(field): React.ReactNode => <field.DateInput label="Revoke At" required />}
				</form.AppField>
				<form.AppField name="permissions">
					{(field): React.ReactNode => <field.CheckboxGroup label="Permissions" required options={permissionsOptions} />}
				</form.AppField>
				{/* biome-ignore-end lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
				{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
				{formState?.success && <p className="success">API Key saved!</p>}
				<form.AppForm>
					<form.SubmitButton label={buttonText} />
				</form.AppForm>
			</Form.Root>
			<FormDevtools />
		</>
	);
}
