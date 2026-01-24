import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import { reset, seed } from 'drizzle-seed';
import * as schema from '../../src/models/schema';
import findD1DatabaseFile from './utils/find-local-db-file';
import generateStandardRefinements from './utils/get-standard-refinements'

const dbPath = findD1DatabaseFile();
console.log(`Seeding database at: ${dbPath}`);

const client = createClient({ url: `file:${dbPath}` });
const db = drizzle(client, { casing: 'snake_case' });

await reset(db as any, schema);

const applyStandardRefinements = await generateStandardRefinements(schema);

// Disable foreign key checks
await client.execute(`PRAGMA foreign_keys = OFF`);

await seed(db as any, schema).refine((f) => {

  const standardRefinements = applyStandardRefinements( f );

  return {
    ...standardRefinements,
    // users: {
    //   ...standardRefinements.users,
    //   columns: {
    //     ...standardRefinements.users.columns,
    //     userId: f.uuid()
    //   }
    // }
  };

})

// Re-enable foreign key checks
await client.execute(`PRAGMA foreign_keys = ON`);

console.log('Seeding complete!');