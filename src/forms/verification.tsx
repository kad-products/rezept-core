'use client';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { saveVerification } from '@/actions/verifications';
import { verificationsSchemas } from '@/schemas';
import type { ActionState, VerificationsDBRead, VerificationsFormInput } from '@/types';
import { useAppForm } from './setup/context';
import { FormDevtools } from './setup/FormDevtools';

export default function VerificationForm({ verification }: { verification: VerificationsFormInput }): React.ReactNode {
	const [formState, setFormState] = useState<ActionState<VerificationsDBRead>>();

	const form = useAppForm({
		formId: 'verification',
		defaultValues: verification,
		validators: {
			onBlur: verificationsSchemas.form,
		},
		onSubmit: async ({ value }: { value: VerificationsFormInput }): Promise<void> => {
			setFormState(await saveVerification(value));
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
				{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
				{formState?.success && <p className="success">Verification saved.</p>}
				<form.AppForm>
					<form.SubmitButton label="Save Verification" />
				</form.AppForm>
			</Form.Root>
			<FormDevtools />
		</>
	);
}
