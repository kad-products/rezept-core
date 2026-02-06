# DB Load

There is `pnpm seed` that generates _pseudorandom_ data for development and test scenarios.  Sometimes we need _real_ data, though, for things like `units` that are basically static and we don't want users to have to enter.  That's where this directory comes in.  

## Naming Convention

Create the file with the table name in kebab case as the filename (ie `users.csv` for the users table).  The `db-load` script will add the assigned drizzle migration numeric prefix to these files as part of the conversion to a drizzle migration.  During development if a file needs to be reprocessed into a migration file remove the prefix and rerun the `db-load` script.

## Immutable

Once a file has been converted into a migration they should not be changed.  Even if they are changed nothing will pick up those changes.  Instead a new file for the same table should be created if there is more data to be loaded.  If the data needs to _change_ then that's a whole different thing and there isn't a solution for that just yet.  Drizzle is working on typescript migrations which seems like the best solution for these sorts of things. 

## Formats

Right now we're just using `csv` for files.  Maybe we try to handle more in the future if we need to but seems pretty unlikely.  The first row should be the headers/field names otherwise the rows would have to contain every single column of the database table which seems silly.  

## Audit Data

The `createdDate` field will be populated with the timestamp of when things are run like normal.  But `createdBy`, however, is tied to the `users` table by a foreign key.  To allow for these loads to keep this constraint intact the first load will be of a "db load" user record.  Once that is there then every subsequent load will use that user's `id` for the `createdBy` value.  