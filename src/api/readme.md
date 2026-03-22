# APIs

- File paths match the API path
- Each TS file exports a default object that is the Worker API handler (whatever methods are supported, etc)
- Export individual handlers privately (JSDoc annotation and _-prefixed) as needed for testing