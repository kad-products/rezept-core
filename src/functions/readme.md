# Server Functions

These are currently just used to save data from forms back to the database.  Perhaps in the future they will do more things but that's what we have so far. 

## Areas of Responsibility

- ✅ Accepting incoming data from HTML forms
- ✅ Standard action signature for parameters and response
- 🚫 No direct data access, use repositories
- 🚫 No type definitions, should rely on repositories for that (which, in turn, rely on models)