# Repositories

These are the "user friendly" wrapper around the models.  While they define the schema and are used directly by Drizzle for the ORM operations these repositories are the methods and types that the rest of the application should use.

## Areas of Responsibility

- ✅ Data access methods that leverage the models
- ✅ Shared/common validation types and methods 
- 🚫 No form- or API-specific validation operations