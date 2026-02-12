import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { CheckboxGroup, Select, TextareaInput, TextInput } from '@/components/form-fields';

export const { fieldContext, formContext, useFieldContext } = createFormHookContexts();

export const { useAppForm } = createFormHook({
	fieldComponents: {
		CheckboxGroup,
		Select,
		TextInput,
		TextareaInput,
	},
	formComponents: {},
	fieldContext,
	formContext,
});
