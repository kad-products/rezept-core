import Papa from 'papaparse';
import type { ZodType } from 'zod';
import { RzStepError } from '@/classes';
import type { RzLogger } from '@/types';

export async function readCsvFromR2Object<T>(bucket: R2Bucket, key: string, logger: RzLogger, schema?: ZodType<T>): Promise<T[]> {
	logger.debug(`Reading CSV from R2 key ${key}`);

	const obj = await bucket.get(key);
	if (!obj) {
		throw new RzStepError(404, 'File not found', `R2 object not found for key: ${key}`, false);
	}

	let csvText: string;
	try {
		csvText = await obj.text();
	} catch (err) {
		throw new RzStepError(500, 'Failed to read file', `Error reading R2 object text for key ${key}: ${err}`, false, err);
	}

	const result = Papa.parse<T>(csvText, {
		header: true,
		skipEmptyLines: true,
		dynamicTyping: true,
		transformHeader: (h: string) => h.replace(/_([a-z])/g, (_, c: string) => c.toUpperCase()),
	});

	if (result.errors.length > 0) {
		const firstError = result.errors[0];
		throw new RzStepError(500, 'Failed to parse CSV', `CSV parse error in row ${firstError.row}: ${firstError.message}`, false);
	}

	if (!schema) {
		return result.data;
	}

	for (let i = 0; i < result.data.length; i++) {
		const validation = schema.safeParse(result.data[i]);
		if (!validation.success) {
			const firstIssue = validation.error.issues[0];
			const field = firstIssue.path.join('.') || '(root)';
			throw new RzStepError(
				422,
				'CSV data does not match expected format',
				`Row ${i + 1}: field "${field}" — ${firstIssue.message}`,
				false,
			);
		}
	}

	return result.data;
}
