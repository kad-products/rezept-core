# Models

These are the Drizzle-compatible schema definitions and core types.  These should really never be accessed directly from application code outside of the `repositories` and Drizzle itself.

## Areas of Responsibility

- ✅ Drizzle schema definition
- ✅ Drizzle relations definitions
- ✅ Type definition for `<TableName>Select`
- ✅ Type definition for `<TableName>FormSave`: Covers Insert and Update, essentially it is all the data we would expect to get from an online form (as opposed to an API call or a batch call we invoke).  Usually this means using the `inferInsert` and omitting the audit fields but some tables could vary a little.
- 🚫 No validation logic or user-friendly methods