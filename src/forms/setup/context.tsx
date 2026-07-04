import { createFormHook, createFormHookContexts } from '@tanstack/react-form';
import { CheckboxGroupInput, DateInput, NumberInput, SelectInput, TextareaInput, TextInput } from './field-components';
import { SubmitButton } from './form-components';

export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

export const { useAppForm } = createFormHook({
	fieldComponents: {
		CheckboxGroupInput,
		DateInput,
		NumberInput,
		SelectInput,
		TextInput,
		TextareaInput,
	},
	formComponents: {
		SubmitButton,
	},
	fieldContext,
	formContext,
});
