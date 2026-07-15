import { describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import { RzStepError } from '@/classes';
import { createNoopLogger } from '@/logger';
import { readCsvFromR2Object } from '@/steps';

const logger = createNoopLogger();

function makeR2Object(csvText: string) {
	return { text: vi.fn().mockResolvedValue(csvText) };
}

function makeBucket(obj: ReturnType<typeof makeR2Object> | null) {
	return { get: vi.fn().mockResolvedValue(obj) } as unknown as R2Bucket;
}

describe('readCsvFromR2Object', () => {
	describe('successful parsing', () => {
		it('returns parsed records from a valid CSV', async () => {
			const bucket = makeBucket(makeR2Object('name,has_seasons\nbacon,false\ntomato,true'));

			const result = await readCsvFromR2Object(bucket, 'test-key', logger);

			expect(result).toHaveLength(2);
		});

		it('transforms snake_case headers to camelCase', async () => {
			const bucket = makeBucket(makeR2Object('name,has_seasons\nbacon,false'));

			const result = await readCsvFromR2Object<{ name: string; hasSeasons: boolean }>(bucket, 'test-key', logger);

			expect(result[0]).toMatchObject({ name: 'bacon', hasSeasons: false });
		});

		it('converts boolean strings to booleans via dynamicTyping', async () => {
			const bucket = makeBucket(makeR2Object('name,has_seasons\ntomato,true\nbacon,false'));

			const result = await readCsvFromR2Object<{ name: string; hasSeasons: boolean }>(bucket, 'test-key', logger);

			expect(result[0].hasSeasons).toBe(true);
			expect(result[1].hasSeasons).toBe(false);
		});

		it('returns empty array for headers-only CSV', async () => {
			const bucket = makeBucket(makeR2Object('name,has_seasons\n'));

			const result = await readCsvFromR2Object(bucket, 'test-key', logger);

			expect(result).toEqual([]);
		});

		it('skips blank lines', async () => {
			const bucket = makeBucket(makeR2Object('name,has_seasons\nbacon,false\n\ntomato,true\n'));

			const result = await readCsvFromR2Object(bucket, 'test-key', logger);

			expect(result).toHaveLength(2);
		});

		it('passes the key to bucket.get', async () => {
			const r2Obj = makeR2Object('name,has_seasons\nbacon,false');
			const bucket = makeBucket(r2Obj);

			await readCsvFromR2Object(bucket, 'ingredients/20240101', logger);

			expect(bucket.get).toHaveBeenCalledWith('ingredients/20240101');
		});
	});

	describe('schema validation', () => {
		const schema = z.object({ name: z.string().min(1), hasSeasons: z.boolean().optional() });

		it('returns records when all rows pass schema validation', async () => {
			const bucket = makeBucket(makeR2Object('name,has_seasons\nbacon,false\ntomato,true'));

			const result = await readCsvFromR2Object(bucket, 'test-key', logger, schema);

			expect(result).toHaveLength(2);
		});

		it('throws RzStepError(422) when a row fails schema validation', async () => {
			const bucket = makeBucket(makeR2Object('name,has_seasons\n,false'));

			await expect(readCsvFromR2Object(bucket, 'test-key', logger, schema)).rejects.toMatchObject({
				code: 422,
			});
		});

		it('throws RzStepError when validation fails, not a generic error', async () => {
			const bucket = makeBucket(makeR2Object('name,has_seasons\n,false'));

			await expect(readCsvFromR2Object(bucket, 'test-key', logger, schema)).rejects.toBeInstanceOf(RzStepError);
		});

		it('includes the row number in the dev message', async () => {
			const bucket = makeBucket(makeR2Object('name,has_seasons\nbacon,false\n,true'));

			const err = await readCsvFromR2Object(bucket, 'test-key', logger, schema).catch(e => e);
			expect(err).toBeInstanceOf(RzStepError);
			expect(err.devMessage).toMatch('Row 2');
		});

		it('validates without schema when schema is omitted', async () => {
			const bucket = makeBucket(makeR2Object('name,has_seasons\n,false'));

			// No schema — even an empty name is returned as-is
			const result = await readCsvFromR2Object(bucket, 'test-key', logger);
			expect(result).toHaveLength(1);
		});
	});

	describe('error handling', () => {
		it('throws RzStepError(404) when the R2 object does not exist', async () => {
			const bucket = makeBucket(null);

			await expect(readCsvFromR2Object(bucket, 'missing-key', logger)).rejects.toMatchObject({
				code: 404,
			});
		});

		it('throws RzStepError(404) as a non-retryable error', async () => {
			const bucket = makeBucket(null);

			const err = await readCsvFromR2Object(bucket, 'missing-key', logger).catch(e => e);
			expect(err).toBeInstanceOf(RzStepError);
			expect(err.retryable).toBe(false);
		});

		it('throws RzStepError(500) when obj.text() rejects', async () => {
			const r2Obj = { text: vi.fn().mockRejectedValue(new Error('stream error')) };
			const bucket = makeBucket(r2Obj);

			await expect(readCsvFromR2Object(bucket, 'test-key', logger)).rejects.toMatchObject({
				code: 500,
			});
		});
	});
});
