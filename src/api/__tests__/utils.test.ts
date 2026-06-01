import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({ REZEPT_ENV: 'development' as string }));
vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

import { RzAccessError, RzStepError } from '@/classes';
import { apiErrorResponse } from '../utils';

describe('apiErrorResponse', () => {
	beforeEach(() => {
		mockEnv.REZEPT_ENV = 'development';
	});

	describe('RzAccessError', () => {
		it('returns the error message and status code', async () => {
			const err = new RzAccessError(403, 'Forbidden');
			const response = apiErrorResponse(err);
			const body = await response.json();

			expect(response.status).toBe(403);
			expect(body).toEqual({ success: false, error: 'Forbidden' });
		});
	});

	describe('RzStepError', () => {
		it('returns devMessage and status code in development', async () => {
			const err = new RzStepError(400, 'Something went wrong', 'Detailed dev error');
			const response = apiErrorResponse(err);
			const body = await response.json();

			expect(response.status).toBe(400);
			expect(body).toEqual({ success: false, error: 'Detailed dev error' });
		});

		it('returns publicMessage in production', async () => {
			mockEnv.REZEPT_ENV = 'production';
			const err = new RzStepError(400, 'Something went wrong', 'Detailed dev error');
			const response = apiErrorResponse(err);
			const body = await response.json();

			expect(response.status).toBe(400);
			expect(body).toEqual({ success: false, error: 'Something went wrong' });
		});
	});

	describe('unexpected errors', () => {
		it('returns 500 with the error message in development', async () => {
			const err = new Error('Unexpected failure');
			const response = apiErrorResponse(err);
			const body = await response.json();

			expect(response.status).toBe(500);
			expect(body).toEqual({ success: false, error: 'Unexpected failure' });
		});

		it('returns 500 with fallback message in production', async () => {
			mockEnv.REZEPT_ENV = 'production';
			const response = apiErrorResponse(new Error('Internal details'), 'Something failed');
			const body = await response.json();

			expect(response.status).toBe(500);
			expect(body).toEqual({ success: false, error: 'Something failed' });
		});

		it('handles non-Error thrown values in development', async () => {
			const response = apiErrorResponse('a plain string error');
			const body = await response.json();

			expect(response.status).toBe(500);
			expect(body).toEqual({ success: false, error: 'An unexpected error occurred' });
		});
	});
});
