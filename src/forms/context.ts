import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { CheckboxGroup, Submit } from './inputs';
import { DateInput, NumberInput, SelectInput, TextareaInput, TextInput } from './utils/fields';

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

export const { useAppForm } = createFormHook({
	fieldComponents: {
		CheckboxGroup,
		DateInput,
		NumberInput,
		SelectInput,
		TextInput,
		TextareaInput,
	},
	formComponents: {
		Submit,
	},
	fieldContext,
	formContext,
});
