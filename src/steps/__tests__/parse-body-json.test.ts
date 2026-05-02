import { describe, expect, it } from 'vitest';
import { RzStepError } from '@/classes';
import { parseBodyJson } from '@/steps';

describe('parseBodyJson', () => {
	it('returns the parsed JSON body', async () => {
		const payload = { url: 'https://example.com/recipe', jsonld: [{ '@type': 'Recipe' }] };
		const request = new Request('https://example.com', {
			method: 'POST',
			body: JSON.stringify(payload),
			headers: { 'Content-Type': 'application/json' },
		});

		const result = await parseBodyJson(request);

		expect(result).toEqual(payload);
	});

	it('throws RzStepError 400 when body is not valid JSON', async () => {
		const request = new Request('https://example.com', {
			method: 'POST',
			body: 'not json at all',
			headers: { 'Content-Type': 'application/json' },
		});

		await expect(parseBodyJson(request)).rejects.toThrow(RzStepError);
		await expect(parseBodyJson(request)).rejects.toMatchObject({ code: 400 });
	});
});
