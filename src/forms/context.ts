import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { CheckboxGroup, DateInput, NumberInput, Select, Submit, TextareaInput, TextInput } from './inputs';

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

export const { useAppForm } = createFormHook({
	fieldComponents: {
		CheckboxGroup,
		DateInput,
		NumberInput,
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
