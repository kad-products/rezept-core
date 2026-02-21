import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { CheckboxGroup, NumberInput, Select, Submit, TextareaInput, TextInput } from './inputs';

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

export const { useAppForm } = createFormHook({
	fieldComponents: {
		CheckboxGroup,
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
