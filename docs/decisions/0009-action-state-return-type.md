# ADR-0009: ActionState<T> Uses the DB Read Type, Not the Input Type

- **Date:** 2026-06-01
- **Status:** Accepted
- **Deciders:** Adam Dehnel

---

## Context and Problem Statement

Server actions return `ActionState<T>`, a generic wrapper that carries either a success payload (`data: T`) or error information. The type parameter `T` was used inconsistently across the codebase: some actions parameterised it with the form input type (e.g. `ActionState<SeasonWriteInput>`), others with the database read type (e.g. `ActionState<ApiKeyDBRead>`).

On a successful mutation, `data` holds the record returned by the repository — a full DB read that includes server-generated fields such as `id`, `createdAt`, and `updatedAt`. The input type has none of these. Parameterising with the input type is therefore a type lie: it claims `data` has the shape of what the user submitted, when it actually has the shape of what the database returned.

## Decision Drivers

- `data` on success always contains a DB read record, not the raw input
- Post-create navigation requires the returned `id`, which is only available from the DB read type
- A single convention eliminates the need to decide per-action, and makes the types self-documenting

## Considered Options

- **Option A:** `ActionState<InputType>` — parameterise with the form input type
- **Option B:** `ActionState<DBReadType>` — parameterise with the database read type

## Decision Outcome

**Option B.** Actions declare their return type as `ActionState<DBReadType>`. The implementation function signature follows the pattern:

```ts
export async function _saveWidget(formData: WidgetFormInput): Promise<ActionState<WidgetDBRead>> {
    // ...
}
```

The form input type remains the parameter type of the implementation function. It is not used as the `ActionState` generic.

### Positive Consequences

- Types accurately reflect what `data` contains at runtime
- Post-create navigation to `/widgets/:id` is straightforward — the returned `id` is typed and available
- Consistent convention eliminates per-action decisions

### Negative Consequences / Trade-offs

- Requires importing the DB read type alongside the input type in every action file — a minor extra import
- Error responses don't use `data` at all, so the `T` parameter is irrelevant for error paths; a unified type means the generic carries no information in the failure case

---

## Pros and Cons of the Options

### Option A: ActionState\<InputType\>

- ✅ No need to import a second type in the action file
- 🚫 Claims `data` has the input shape when it actually has the DB read shape — a type lie
- 🚫 Post-create navigation to `/entity/:id` requires a cast or a second request to get the generated `id`

### Option B: ActionState\<DBReadType\>

- ✅ Accurately types what `data` contains on success
- ✅ Generated fields (`id`, `createdAt`, etc.) are available to forms without extra work
- 🚫 One additional import per action file
