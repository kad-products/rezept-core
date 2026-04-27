# Forms

Forms are the client-side entry point for data mutations. See [project architecture](../../docs/development/project-architecture.md) for where forms fit relative to other types.

## What they do

Forms render UI for user input, validate that input, and call server actions to persist it. Data flows in from the parent page as props; mutations flow out through server actions.

## Structure

```
src/forms/
  context.ts        — TanStack Form hook setup; exports useAppForm
  inputs/           — registered field components (TextInput, Select, etc.)
  recipe.tsx        — entity form
  season.tsx
  api-key.tsx
```

### Form system (`context.ts` + `inputs/`)

`context.ts` wires TanStack Form's `createFormHook` with the registered field components and exports `useAppForm`. Entity forms import `useAppForm` from here — never directly from `@tanstack/react-form`.

Input components in `inputs/` are TanStack Form field components. They use `useFieldContext` and `useFormContext` from `context.ts` and only work within a TanStack Form context. They are not generic UI components.

### Entity forms

One file per entity. Each file has a single default export — the form component.

```tsx
'use client';
import { useAppForm } from './context';
import { saveRecipe } from '@/actions/recipes';
import type { ActionState, RecipeFormData } from '@/types';

export default function FormRecipe({ recipe }: { recipe?: Recipe }) {
    const [formState, setFormState] = useState<ActionState<RecipeFormData>>();

    const form = useAppForm({
        defaultValues: recipe ?? {},
        validators: { onBlur: recipeSchemas.form },
        onSubmit: async ({ value }) => {
            setFormState(await saveRecipe(value));
        },
    });

    return (
        <form onSubmit={...}>
            <form.AppField name="title">{field => <field.TextInput label="Title" />}</form.AppField>
            {formState?.errors?._form && <p className="error">{formState.errors._form[0]}</p>}
            <form.AppForm>
                <form.Submit label="Save Recipe" />
            </form.AppForm>
        </form>
    );
}
```

## Radix Form + TanStack Form

These two libraries have distinct roles and are used together:

- **Radix Form** — structural and accessibility layer: the form element, label↔input wiring, ARIA attributes, accessible error messages
- **TanStack Form** — state and validation layer: field state, schema validation, submission handling

The bridge between them is `Form.Message forceMatch={true}` — it tells Radix to render the message unconditionally, so TanStack's validation errors display through Radix's accessible message structure.

Entity forms use `Form.Root` as the outer element. Input components use `Form.Field`, `Form.Label`, `Form.Control asChild`, and `Form.Message forceMatch={true}`:

```tsx
// entity form
<Form.Root onSubmit={...}>
    <form.AppField name="title">{field => <field.TextInput label="Title" />}</form.AppField>
</Form.Root>

// input component
export function TextInput({ label }: { label: string }) {
    const field = useFieldContext<string>();
    return (
        <Form.Field name={field.name}>
            <Form.Label>{label}</Form.Label>
            {!field.state.meta.isValid && (
                <Form.Message forceMatch={true}>{field.state.meta.errors[0]?.message}</Form.Message>
            )}
            <Form.Control asChild>
                <input value={field.state.value} onChange={e => field.handleChange(e.target.value)} onBlur={field.handleBlur} />
            </Form.Control>
        </Form.Field>
    );
}
```

Not all input components follow this pattern yet — `Select` and `Textarea` use native HTML. Bringing them in line is tracked in the audit phase.

## Validation

Forms validate with `validators: { onBlur: schema }` — validation runs when a field loses focus. This is the current standard but is under review for UX reasons; see #126.

## Naming

Form components use a `Form` prefix: `FormRecipe`, `FormSeason`, `FormApiKey`. This aids autocomplete and makes it clear in the component tree that a component is a form.

## Guidelines

- **`'use client'` first line** — all form files are client components
- **`useAppForm` from `./context`** — never import directly from `@tanstack/react-form`
- **`Form.Root` as the form element** — not a native `<form>` element
- **Radix Form in all input components** — `Form.Field`, `Form.Label`, `Form.Control asChild`, `Form.Message forceMatch={true}`
- **Props for data** — pages fetch data and pass it down; forms do not access repositories
- **Server actions in `onSubmit`** — mutations go through `@/actions`
- **`ActionState` in `useState`** — hold the server action response locally to display errors and success messages
- **Default export** — one form component per file
- **No type definitions** — types live in `@/types`
