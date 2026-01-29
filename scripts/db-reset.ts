import fs from 'node:fs/promises';
import findD1DatabaseFile from './utils/find-local-db-file';

const dbPath = findD1DatabaseFile();
console.log(`Resetting database at: ${dbPath}`);

await fs.unlink(dbPath);
