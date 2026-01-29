import { readdirSync } from 'node:fs';
import { join } from 'node:path';

export default function findD1DatabaseFile(): string {
	const d1Dir = '.wrangler/state/v3/d1/miniflare-D1DatabaseObject';

	try {
		const files = readdirSync(d1Dir);
		const sqliteFiles = files.filter(file => file.endsWith('.sqlite'));

		if (sqliteFiles.length === 0) {
			throw new Error('No D1 database files found. Have you run your app locally yet?');
		}

		if (sqliteFiles.length > 1) {
			throw new Error(
				`Multiple D1 database files found: ${sqliteFiles.join(', ')}. ` +
					'Please specify which one to use manually.',
			);
		}

		return join(d1Dir, sqliteFiles[0]);
	} catch (error) {
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			throw new Error(
				`D1 directory not found at ${d1Dir}. ` +
					'Make sure you have run your app locally with Wrangler at least once.',
			);
		}
		throw error;
	}
}
