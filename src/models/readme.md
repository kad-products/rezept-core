# Models

These are the Drizzle-compatible schema definitions and core types.  These should really never be accessed directly from application code outside of the `repositories` and Drizzle itself.

## Areas of Responsibility

- ✅ Drizzle schema definition
- ✅ Drizzle relations definitions
- ✅ Type definition for `<TableName>Select`
- ✅ Type definition for `<TableName>FormSave` (covers Insert and Update)
- 🚫 No validation logic or user-friendly methods