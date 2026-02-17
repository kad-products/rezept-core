import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { CheckboxGroup, Select, TextareaInput, TextInput } from './inputs';

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
