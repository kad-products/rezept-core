import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { CheckboxGroup, Select, Submit } from './inputs';
import { DateInput, NumberInput, TextareaInput, TextInput } from './utils/fields';

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
