'use client';
import { TanStackDevtools } from '@tanstack/react-devtools';
import { formDevtoolsPlugin } from '@tanstack/react-form-devtools';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { saveApiKey } from '@/actions/api-keys';
import permissions from '@/data/permissions';
import { apiKeyFormSchema } from '@/schemas';
import type { ActionState, ApiKey, ApiKeyFormData } from '@/types';
import { useAppForm } from './context';

export default function FormApiKey({ apiKey, currentUserId }: { apiKey?: ApiKey; currentUserId: string | undefined }) {
	const [formState, setFormState] = useState<ActionState<ApiKeyFormData>>();

	const newApiKeyDefaults = {
		permissions: [],
		userId: currentUserId,
	};

	const form = useAppForm({
		defaultValues: (apiKey ? apiKey : newApiKeyDefaults) as ApiKeyFormData,
		validators: {
			onBlur: apiKeyFormSchema,
		},
		onSubmit: async ({ value: formDataObj }) => {
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
				onSubmit={e => {
					console.log(`Trying to submit the form`);
					e.preventDefault();
					e.stopPropagation();
					console.log(`About to hit the go button`);

					console.log('=== PRE-SUBMISSION STATE ===');
					console.log('canSubmit:', form.state.canSubmit);
					console.log('isValid:', form.state.isValid);
					console.log('Errors:', form.state.errors);
					console.log('Values:', form.state.values);
					console.log('Submission attempts:', form.state.submissionAttempts);
					form.handleSubmit();
				}}
			>
				<form.AppField name="name">{field => <field.TextInput label="Name" required />}</form.AppField>
				<form.AppField name="permissions">
					{field => <field.CheckboxGroup label="Permissions" required options={permissionsOptions} />}
				</form.AppField>
				{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
				{formState?.success && <p className="success">API Key saved!</p>}
				<form.AppForm>
					<form.Submit label={buttonText} />
				</form.AppForm>
				<form.Subscribe
					key={form.state.submissionAttempts} // Force re-render on each attempt
					selector={state => ({
						errors: state.errors,
						attempts: state.submissionAttempts,
					})}
				>
					{state => (
						<div>
							<pre>Submission Attempts: {state.attempts}</pre>
							<pre>Errors: {JSON.stringify(state.errors, null, 2)}</pre>
						</div>
					)}
				</form.Subscribe>
			</Form.Root>
			{import.meta.env.DEV && <TanStackDevtools plugins={[formDevtoolsPlugin()]} />}
		</>
	);
}
