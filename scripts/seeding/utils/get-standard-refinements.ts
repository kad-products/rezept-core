// biome-ignore lint/suspicious/noExplicitAny: drizzle-seed doesn't export generator types
export type GeneratorAPI = Record<string, (...args: any[]) => any>;

type TableRefinement = {
	columns: Record<string, unknown>;
	count?: number;
	with?: Record<string, number>;
};

type SchemaRefinements = Record<string, TableRefinement>;

type DrizzleTable = {
	_: {
		name: string;
		columns: Record<string, unknown>;
	};
};

export default function getStandardRefinements(schema: Record<string, DrizzleTable | unknown>) {
	return (f: GeneratorAPI): SchemaRefinements => {
		const refinements: SchemaRefinements = {};

		console.log('Schema keys:', Object.keys(schema));

		for (const [tableName, table] of Object.entries(schema)) {
			console.log(`Checking ${tableName}:`, {
				isObject: typeof table === 'object',
				hasUnderscore: '_' in (table as object),
				keys: Object.keys(table || {}),
			});

			// Skip if it's a relations object (ends with "Relations")
			if (tableName.endsWith('Relations')) {
				console.log(`Skipping relation ${tableName}`);
				continue;
			}

			// Skip if it's a type export (not a runtime value)
			if (!table || typeof table !== 'object') {
				console.log(`Skipping ${tableName}`);
				continue;
			}

			console.log(`Adding refinement for ${tableName}`);
			refinements[tableName] = {
				columns: {
					id: f.uuid(),
					createdAt: f.datetime(),
					createdBy: f.uuid(),
					updatedAt: f.datetime(),
					updatedBy: f.uuid(),
					deletedAt: f.datetime(),
					deletedBy: f.uuid(),
				},
			};
			console.log(`Added refinements: ${JSON.stringify(refinements[tableName], null, 4)}`);
		}

		console.log('Final refinements are on these tables:', Object.keys(refinements));
		return refinements;
	};
}
