'use client';
import { Form } from 'radix-ui';
import { useState } from 'react';
import { saveUser } from '@/actions/users';
import { userRoles } from '@/data/roles';
import { usersSchemas } from '@/schemas';
import type { ActionState, UserAdminEditInput, UserDBRead } from '@/types';
import { useAppForm } from './setup/context';

const roleOptions = userRoles.map(r => ({ value: r, label: r[0] + r.slice(1).toLowerCase() }));

export default function UserForm({ user }: { user: UserDBRead }): React.ReactNode {
	const [formState, setFormState] = useState<ActionState<UserDBRead>>();

	const form = useAppForm({
		formId: 'user',
		defaultValues: {
			id: user.id,
			username: user.username,
			role: user.role ?? 'BASIC',
		} as UserAdminEditInput,
		validators: {
			onBlur: usersSchemas.adminEdit,
		},
		onSubmit: async ({ value }: { value: UserAdminEditInput }): Promise<void> => {
			setFormState(await saveUser(value));
		},
	});

	return (
		<Form.Root
			className="rz-form"
			onSubmit={(e: React.FormEvent): void => {
				e.preventDefault();
				e.stopPropagation();
				form.handleSubmit();
			}}
		>
			{/* biome-ignore-start lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
			<form.AppField name="username">{(field): React.ReactNode => <field.TextInput label="Username" required />}</form.AppField>
			<form.AppField name="role">
				{(field): React.ReactNode => <field.SelectInput label="Role" options={roleOptions} required />}
			</form.AppField>
			{/* biome-ignore-end lint/nursery/useExplicitType: TanStack Form field render prop — parameter type is a deep internal generic impractical to annotate */}
			{formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
			{formState?.success && <p className="success">User saved.</p>}
			<form.AppForm>
				<form.SubmitButton label="Save User" />
			</form.AppForm>
		</Form.Root>
	);
}
