import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk-template';
import { snakeCase } from 'change-case';
import Papa from 'papaparse';

type CSVRow = Record<string, string>;

const allFiles = await fs.readdir(path.join(process.cwd(), 'db-load'));
const dbLoadFiles = allFiles.filter(f => f.endsWith('.csv'));

console.log(chalk`\nFound {cyan ${dbLoadFiles.length}} files in the db-load directory`);

const unprocessedFiles = dbLoadFiles.filter(f => !/^\d+/.test(f));

console.log(chalk`\nFound {cyan ${unprocessedFiles.length}} unprocessed files to load`);

for (const file of unprocessedFiles) {
	const tableName = snakeCase(path.parse(file).name);

	console.log(chalk`\nLoading DB file {yellow ${file}} into table {green ${tableName}}`);

	const contents = await fs.readFile(path.join(process.cwd(), 'db-load', file), 'utf-8');
	const csvParseResult = Papa.parse<CSVRow>(contents, {
		header: true,
		skipEmptyLines: true,
		transform: value => value.trim(), // Auto-trim all values
	});

	const fields = csvParseResult.meta.fields || [];
	const rows = csvParseResult.data;

	console.log(chalk`  Found fields: {cyan ${fields.join(', ')}}`);
	console.log(chalk`  Found rows: {cyan ${rows.length}}`);

	let result: string;
	try {
		const migrationName = `seed_${tableName}`;
		result = execSync(`pnpm drizzle-kit generate --custom --name=${migrationName}`, {
			encoding: 'utf-8',
		});
	} catch (error) {
		console.error(chalk`{red Failed to generate migration:}`, error);
		continue; // Skip this file
	}

	const migrationFilenameLines = result
		.toString()
		.split('\n')
		.filter(line => line.trim().includes('Your SQL migration file'));
	if (migrationFilenameLines.length !== 1) {
		throw new Error('Could not determine migration filename from drizzle-kit output');
	}

	const filenameRegex = migrationFilenameLines[0].trim().match(/([\w-]+\.sql)/);
	const migrationFilename = filenameRegex ? filenameRegex[1] : null;
	if (!migrationFilename) {
		throw new Error('Could not parse migration filename from drizzle-kit output');
	}

	console.log(chalk`  Generated migration file: {cyan ${migrationFilename}}`);
	const migrationNumber = migrationFilename.split('_')[0];
	const newFileName = `${migrationNumber}_${file}`;

	const sql = `-- ${newFileName} data load
INSERT INTO ${tableName} (${fields.map(f => `"${f}"`).join(', ')}) VALUES 
${rows
	.map(row => {
		const vals = fields.map(field => {
			const val = row[field];
			// Handle NULL/empty values
			if (!val || val === 'NULL' || val.toLowerCase() === 'null') {
				return 'NULL';
			}
			// Escape single quotes and backslashes for SQL
			const escaped = val
				.replace(/\\/g, '\\\\') // Escape backslashes first
				.replace(/'/g, "''"); // Escape single quotes
			return `'${escaped}'`;
		});
		return `(${vals.join(', ')})`;
	})
	.join(',\n')};`;

	// write sql to migration file
	await fs.writeFile(path.join(process.cwd(), 'drizzle', migrationFilename), sql);

	// rename source csv file to reference migration number which indicates it has been processed
	await fs.rename(path.join(process.cwd(), 'db-load', file), path.join(process.cwd(), 'db-load', newFileName));
	console.log(chalk`  Wrote SQL to migration file and renamed source file to {yellow ${newFileName}}`);
}
