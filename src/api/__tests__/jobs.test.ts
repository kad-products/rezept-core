import { beforeEach, describe, expect, it, vi } from 'vitest';
import Logger from '@/logger';

vi.mock('@/interrupters', () => ({
	requireAuthentication: vi.fn(),
	requirePermissions: vi.fn(() => vi.fn()),
}));

vi.mock('@/repositories', () => ({
	createBackgroundJob: vi.fn(),
	getLatestBackgroundJobByName: vi.fn(),
}));

import { requireAuthentication, requirePermissions } from '@/interrupters';
import { createBackgroundJob, getLatestBackgroundJobByName } from '@/repositories';
import handler, { _getHandler, _postHandler } from '../jobs';

const makeCtx = () => ({
	logger: new Logger(),
	user: { id: 'user-123' },
});

const makeRequestInfo = (method: string, jobName: string) => ({
	request: new Request(`https://example.com/api/jobs/${jobName}`, { method }),
	params: { jobName },
	ctx: makeCtx(),
});

describe('jobs API', () => {
	beforeEach(() => {
		vi.resetAllMocks();
		vi.mocked(requireAuthentication).mockResolvedValue(undefined);
		vi.mocked(requirePermissions).mockReturnValue(vi.fn().mockResolvedValue(undefined));
	});

	describe('route handler', () => {
		it('GET chain includes requireAuthentication', () => {
			expect(handler.get).toContain(requireAuthentication);
		});

		it('GET chain ends with _getHandler', () => {
			expect(handler.get[handler.get.length - 1]).toBe(_getHandler);
		});

		it('POST chain includes requireAuthentication', () => {
			expect(handler.post).toContain(requireAuthentication);
		});

		it('POST chain ends with _postHandler', () => {
			expect(handler.post[handler.post.length - 1]).toBe(_postHandler);
		});
	});

	describe('_getHandler', () => {
		it('returns 404 when no job exists for that name', async () => {
			vi.mocked(getLatestBackgroundJobByName).mockResolvedValue(null);

			const response = await _getHandler(makeRequestInfo('GET', 'unknown-job') as any);

			expect(response.status).toBe(404);
			const body = (await response.json()) as any;
			expect(body.success).toBe(false);
		});

		it('returns job data when found', async () => {
			const mockJob = { id: 'job-123', name: 'test-job', status: 'PENDING' };
			vi.mocked(getLatestBackgroundJobByName).mockResolvedValue(mockJob as any);

			const response = await _getHandler(makeRequestInfo('GET', 'test-job') as any);

			expect(response.status).toBe(200);
			const body = (await response.json()) as any;
			expect(body.success).toBe(true);
			expect(body.data.id).toBe('job-123');
		});
	});

	describe('_postHandler', () => {
		it('returns 404 for unknown job name', async () => {
			const response = await _postHandler(makeRequestInfo('POST', 'unknown-job') as any);

			expect(response.status).toBe(404);
			const body = (await response.json()) as any;
			expect(body.success).toBe(false);
		});

		it('does not call createBackgroundJob for unknown job name', async () => {
			await _postHandler(makeRequestInfo('POST', 'unknown-job') as any);

			expect(createBackgroundJob).not.toHaveBeenCalled();
		});
	});
});
