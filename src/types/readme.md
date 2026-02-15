# Types

Any shared type.  Some are from DB entities and some are just shared types.

## Areas of Responsibility

- ✅ Type definition for `<TableName>Select`
- ✅ Type definition for `<TableName>FormSave`: Covers Insert and Update, essentially it is all the data we would expect to get from an online form (as opposed to an API call or a batch call we invoke).  Usually this means using the `inferInsert` and omitting the audit fields but some tables could vary a little.