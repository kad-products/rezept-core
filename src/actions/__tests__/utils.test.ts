import { beforeEach, describe, expect, it, vi } from 'vitest';

const mockEnv = vi.hoisted(() => ({ REZEPT_ENV: 'development' as string }));
vi.mock('cloudflare:workers', () => ({ env: mockEnv }));

import { errorResponse, successResponse } from '../utils';

describe('errorResponse', () => {
	beforeEach(() => {
		mockEnv.REZEPT_ENV = 'development';
	});

	it('passes field-level Zod errors through directly in development', () => {
		const result = errorResponse({ name: ['Required'] }, 400);
		expect(result.success).toBe(false);
		expect(result.code).toBe(400);
		expect(result.errors).toEqual({ name: ['Required'] });
	});

	it('extracts the message from an Error instance in development', () => {
		const result = errorResponse(new Error('Something went wrong'), 500);
		expect(result.success).toBe(false);
		expect(result.errors?._form?.[0]).toBe('Something went wrong');
	});

	it('stringifies non-Error, non-object values in development', () => {
		const result = errorResponse('raw string error', 400);
		expect(result.errors?._form?.[0]).toBe('raw string error');
	});

	it('uses prodErrorMessage in production when provided', () => {
		mockEnv.REZEPT_ENV = 'production';
		const result = errorResponse(new Error('Sensitive details'), 500, 'Failed to save');
		expect(result.errors?._form?.[0]).toBe('Failed to save');
	});

	it('falls back to "An error occurred" in production when prodErrorMessage is omitted', () => {
		mockEnv.REZEPT_ENV = 'production';
		const result = errorResponse(new Error('Sensitive details'), 500);
		expect(result.errors?._form?.[0]).toBe('An error occurred');
	});
});

describe('successResponse', () => {
	it('returns success with data and default 200 status', () => {
		const result = successResponse({ id: '1' });
		expect(result.success).toBe(true);
		expect(result.code).toBe(200);
		expect(result.data).toEqual({ id: '1' });
	});

	it('uses provided status code', () => {
		const result = successResponse({ id: '1' }, 201);
		expect(result.code).toBe(201);
	});
});
