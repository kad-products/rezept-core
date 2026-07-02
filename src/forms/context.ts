import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { CheckboxGroup, NumberInput, Select, Submit, TextareaInput } from './inputs';
import { DateInput, TextInput } from './utils/fields';

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
