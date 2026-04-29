import { createFormHook, createFormHookContexts } from '@tanstack/react-form';

import { CheckboxGroup, NumberInput, Select, Submit, TextareaInput, TextInput } from './inputs';

// biome-ignore lint/nursery/useExplicitType: TanStack Form generic types from createFormHookContexts are impractical to annotate explicitly
export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();

// biome-ignore lint/nursery/useExplicitType: TanStack Form generic types from createFormHook are impractical to annotate explicitly
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
