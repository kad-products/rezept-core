import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { CheckboxGroup, Select, Submit, TextareaInput, TextInput } from './inputs';

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

export const { useAppForm } = createFormHook({
	fieldComponents: {
		CheckboxGroup,
		Select,
		TextInput,
		TextareaInput,
	},
	formComponents: {
		Submit,
	},
	fieldContext,
	formContext,
});
