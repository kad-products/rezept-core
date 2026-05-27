import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/repositories', () => ({
	updateBackgroundJobStatus: vi.fn(),
}));

import { updateBackgroundJobStatus } from '@/repositories';
import { JobDurableObject } from '../jobs';

class MockDurableObjectStorage {
	private store = new Map<string, unknown>();

	async get<T>(key: string): Promise<T | undefined> {
		return this.store.get(key) as T | undefined;
	}

	async put(key: string, value: unknown): Promise<void> {
		this.store.set(key, value);
	}

	async delete(key: string): Promise<void> {
		this.store.delete(key);
	}

	async list(options?: { prefix?: string }): Promise<Map<string, unknown>> {
		if (!options?.prefix) return new Map(this.store);
		const result = new Map<string, unknown>();
		for (const [key, value] of this.store) {
			if (key.startsWith(options.prefix)) result.set(key, value);
		}
		return result;
	}
}

class MockDurableObjectState {
	storage = new MockDurableObjectStorage();
	id = { name: 'test-job-id', toString: () => 'test-job-id-hex' };
	waitUntil = () => {};
	blockConcurrencyWhile = async (fn: () => Promise<void>) => await fn();
}

describe('JobDurableObject', () => {
	let job: JobDurableObject;
	let mockState: MockDurableObjectState;

	beforeEach(() => {
		vi.resetAllMocks();
		mockState = new MockDurableObjectState();
		job = new JobDurableObject(mockState as unknown as DurableObjectState, {} as Env);
	});

	describe('initialize', () => {
		it('stores userId in storage', async () => {
			await job.initialize('user-123');

			const stored = await mockState.storage.get('jobRequestorUserId');
			expect(stored).toBe('user-123');
		});
	});

	describe('setTotalCount / getTotalCount', () => {
		it('returns 0 when no count has been set', async () => {
			expect(await job.getTotalCount()).toBe(0);
		});

		it('stores and retrieves count', async () => {
			await job.setTotalCount(5);

			expect(await job.getTotalCount()).toBe(5);
		});
	});

	describe('setProcessorStatus / getProcessorStatus', () => {
		it('stores processor status', async () => {
			await job.setProcessorStatus('proc-1', 'RUNNING');

			expect(await job.getProcessorStatus('proc-1')).toBe('RUNNING');
		});

		it('updates processor status', async () => {
			await job.setProcessorStatus('proc-1', 'RUNNING');
			await job.setProcessorStatus('proc-1', 'COMPLETED');

			expect(await job.getProcessorStatus('proc-1')).toBe('COMPLETED');
		});

		it('returns null for an unknown processor', async () => {
			expect(await job.getProcessorStatus('unknown')).toBeNull();
		});
	});

	describe('finalize', () => {
		it('updates job status to COMPLETED', async () => {
			await job.initialize('user-123');

			await job.finalize('COMPLETED');

			expect(updateBackgroundJobStatus).toHaveBeenCalledWith('test-job-id', 'COMPLETED', null, 'user-123', expect.anything());
		});

		it('does not call updateBackgroundJobStatus when userId is missing', async () => {
			// initialize never called — no userId in storage
			await job.finalize('COMPLETED');

			expect(updateBackgroundJobStatus).not.toHaveBeenCalled();
		});

		it('does not call updateBackgroundJobStatus when jobId (ctx.id.name) is missing', async () => {
			const stateWithoutName = new MockDurableObjectState();
			(stateWithoutName.id as any).name = undefined;
			const jobWithoutName = new JobDurableObject(stateWithoutName as unknown as DurableObjectState, {} as Env);

			await jobWithoutName.initialize('user-123');
			await jobWithoutName.finalize('COMPLETED');

			expect(updateBackgroundJobStatus).not.toHaveBeenCalled();
		});
	});

	describe('completion detection', () => {
		// EXPECTED TO FAIL: Object.entries(Map) returns [] so every() is vacuously true,
		// causing finalize() to fire on every setProcessorStatus call regardless of status.
		it('does not finalize when a processor reports RUNNING', async () => {
			await job.initialize('user-123');
			await job.setTotalCount(2);

			await job.setProcessorStatus('proc-1', 'RUNNING');

			expect(updateBackgroundJobStatus).not.toHaveBeenCalled();
		});

		// EXPECTED TO FAIL: same root cause — plus totalCount is never checked,
		// so one COMPLETED processor out of many would trigger premature finalization.
		it('does not finalize when only a subset of processors have completed', async () => {
			await job.initialize('user-123');
			await job.setTotalCount(3);

			await job.setProcessorStatus('proc-1', 'COMPLETED');
			// proc-2 and proc-3 have not reported yet

			expect(updateBackgroundJobStatus).not.toHaveBeenCalled();
		});

		it('finalizes when all processors report COMPLETED', async () => {
			await job.initialize('user-123');
			await job.setTotalCount(2);

			await job.setProcessorStatus('proc-1', 'COMPLETED');
			await job.setProcessorStatus('proc-2', 'COMPLETED');

			expect(updateBackgroundJobStatus).toHaveBeenCalledWith('test-job-id', 'COMPLETED', null, 'user-123', expect.anything());
		});

		it('finalizes exactly once when all processors complete', async () => {
			await job.initialize('user-123');
			await job.setTotalCount(2);

			await job.setProcessorStatus('proc-1', 'COMPLETED');
			await job.setProcessorStatus('proc-2', 'COMPLETED');

			expect(updateBackgroundJobStatus).toHaveBeenCalledTimes(1);
		});

		// EXPECTED TO FAIL: current logic only finalizes when ALL statuses are COMPLETED.
		// A FAILED processor means the every() check never passes, leaving the job in RUNNING forever.
		it('finalizes as FAILED when any processor reports FAILED', async () => {
			await job.initialize('user-123');
			await job.setTotalCount(2);

			await job.setProcessorStatus('proc-1', 'COMPLETED');
			await job.setProcessorStatus('proc-2', 'FAILED');

			expect(updateBackgroundJobStatus).toHaveBeenCalledWith(
				'test-job-id',
				'FAILED',
				expect.toBeOneOf([null, String]),
				'user-123',
				expect.anything(),
			);
		});

		// EXPECTED TO FAIL: same as above — job is left permanently in RUNNING state.
		it('does not leave the job in RUNNING state when a processor fails', async () => {
			await job.initialize('user-123');
			await job.setTotalCount(1);

			await job.setProcessorStatus('proc-1', 'FAILED');

			expect(updateBackgroundJobStatus).toHaveBeenCalled();
		});
	});
});
