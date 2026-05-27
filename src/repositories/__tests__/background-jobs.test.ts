import { beforeEach, describe, expect, it } from 'vitest';
import Logger from '@/logger';
import { createUser } from '@/repositories';
import { resetDb } from '../../../tests/mocks/db';
import { createBackgroundJob, getLatestBackgroundJobByName, updateBackgroundJobStatus } from '../background-jobs';

const logger = new Logger();
const TEST_JOB_NAME = 'test-job';

describe('background-jobs repository', () => {
	let testUserId: string;

	beforeEach(async () => {
		await resetDb();
		const user = await createUser('testuser', null, logger);
		testUserId = user.id;
	});

	describe('createBackgroundJob', () => {
		it('creates a job with PENDING status', async () => {
			const job = await createBackgroundJob(TEST_JOB_NAME, testUserId, logger);

			expect(job.name).toBe(TEST_JOB_NAME);
			expect(job.status).toBe('PENDING');
		});

		it('sets audit fields', async () => {
			const job = await createBackgroundJob(TEST_JOB_NAME, testUserId, logger);

			expect(job.createdBy).toBe(testUserId);
			expect(job.createdAt).toBeTruthy();
			expect(job.updatedAt).toBeNull();
			expect(job.completedAt).toBeNull();
			expect(job.notes).toBeNull();
		});

		it('assigns a unique id', async () => {
			const job1 = await createBackgroundJob(TEST_JOB_NAME, testUserId, logger);
			const job2 = await createBackgroundJob(TEST_JOB_NAME, testUserId, logger);

			expect(job1.id).not.toBe(job2.id);
		});
	});

	describe('updateBackgroundJobStatus', () => {
		it('updates the status', async () => {
			const job = await createBackgroundJob(TEST_JOB_NAME, testUserId, logger);
			const updated = await updateBackgroundJobStatus(job.id, 'RUNNING', null, testUserId, logger);

			expect(updated.status).toBe('RUNNING');
		});

		it('sets notes when provided', async () => {
			const job = await createBackgroundJob(TEST_JOB_NAME, testUserId, logger);
			const updated = await updateBackgroundJobStatus(job.id, 'FAILED', 'Something went wrong', testUserId, logger);

			expect(updated.notes).toBe('Something went wrong');
		});

		it('sets completedAt for COMPLETED status', async () => {
			const job = await createBackgroundJob(TEST_JOB_NAME, testUserId, logger);
			const updated = await updateBackgroundJobStatus(job.id, 'COMPLETED', null, testUserId, logger);

			expect(updated.completedAt).toBeTruthy();
		});

		it('sets completedAt for FAILED status', async () => {
			const job = await createBackgroundJob(TEST_JOB_NAME, testUserId, logger);
			const updated = await updateBackgroundJobStatus(job.id, 'FAILED', null, testUserId, logger);

			expect(updated.completedAt).toBeTruthy();
		});

		it('does not set completedAt for non-terminal statuses', async () => {
			const job = await createBackgroundJob(TEST_JOB_NAME, testUserId, logger);
			const updated = await updateBackgroundJobStatus(job.id, 'RUNNING', null, testUserId, logger);

			expect(updated.completedAt).toBeNull();
		});

		it('sets updatedBy', async () => {
			const job = await createBackgroundJob(TEST_JOB_NAME, testUserId, logger);
			const updated = await updateBackgroundJobStatus(job.id, 'RUNNING', null, testUserId, logger);

			expect(updated.updatedBy).toBe(testUserId);
		});
	});

	describe('getLatestBackgroundJobByName', () => {
		it('returns null when no jobs exist for that name', async () => {
			const result = await getLatestBackgroundJobByName(TEST_JOB_NAME, logger);

			expect(result).toBeNull();
		});

		it('returns the job when one exists', async () => {
			const job = await createBackgroundJob(TEST_JOB_NAME, testUserId, logger);
			const result = await getLatestBackgroundJobByName(TEST_JOB_NAME, logger);

			expect(result?.id).toBe(job.id);
		});

		it('returns the most recent job when multiple exist', async () => {
			await createBackgroundJob(TEST_JOB_NAME, testUserId, logger);
			const latest = await createBackgroundJob(TEST_JOB_NAME, testUserId, logger);
			const result = await getLatestBackgroundJobByName(TEST_JOB_NAME, logger);

			expect(result?.id).toBe(latest.id);
		});

		it('does not return jobs for a different name', async () => {
			await createBackgroundJob('other-job', testUserId, logger);
			const result = await getLatestBackgroundJobByName(TEST_JOB_NAME, logger);

			expect(result).toBeNull();
		});
	});
});
