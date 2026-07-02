import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { CheckboxGroup } from './inputs';
import { DateInput, NumberInput, SelectInput, TextareaInput, TextInput } from './setup/field-components';
import { SubmitButton } from './setup/form-components';

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
		SubmitButton,
	},
	fieldContext,
	formContext,
});
