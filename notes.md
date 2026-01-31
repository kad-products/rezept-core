# Notes

## Helper/Boilerplate

- Have a Save schema type in models that isn't the inferInsert because that contains the audit props which I don't want to have to provide.  Don't see much of a purpose in the Insert type at the moment.  
- Use that type in the existing two repositories that create the smaller type definition
- Figure out a helper/wrapper for the `createInsertSchema` to handle defaults and empty strings and the audit fields. 

## AntD projects

https://github.com/jsxiaosi/react-xs-admin