import { DurableObject } from 'cloudflare:workers';
import RzLogger from '@/logger';
import { updateBackgroundJobStatus } from '@/repositories';
import type { BackgroundJobStatus } from '@/types';

const logger: RzLogger = new RzLogger();

export class JobDurableObject extends DurableObject {
	async initialize(userId: string): Promise<void> {
		await this.ctx.storage.put('jobRequestorUserId', userId);
	}

	async setTotalCount(count: number): Promise<void> {
		await this.ctx.storage.put('totalCount', count);
	}

	async setProcessorStatus(processorId: string, status: BackgroundJobStatus): Promise<void> {
		await this.ctx.storage.put(`processorStatus:${processorId}`, status);
		const totalCount = await this.ctx.storage.get<number>('totalCount');

		const allStatuses = await this.ctx.storage.list({ prefix: 'processorStatus:' });

		const allStatusStrings = Array.from(allStatuses.values()).map(status => status as BackgroundJobStatus);

		if (allStatusStrings.includes('FAILED')) {
			this.finalize('FAILED');
		}

		if (allStatusStrings.length === totalCount && allStatusStrings.every(status => status === 'COMPLETED')) {
			this.finalize('COMPLETED');
		}
	}

	async getProcessorStatus(processorId: string): Promise<BackgroundJobStatus | null> {
		const status = await this.ctx.storage.get<BackgroundJobStatus>(`processorStatus:${processorId}`);
		return status ?? null;
	}

	async getTotalCount(): Promise<number> {
		const count = await this.ctx.storage.get<number>('totalCount');
		return count ?? 0;
	}

	async finalize(status: BackgroundJobStatus): Promise<void> {
		const jobId = this.ctx.id.name; // we rely on the DO always being created with jobId as the name
		const jobRequestorUserId = await this.ctx.storage.get<string>('jobRequestorUserId');

		if (!jobRequestorUserId) {
			logger.error('JobDurableObject missing job requestor user ID, cannot finalize job');
			return;
		}

		if (!jobId) {
			logger.error('JobDurableObject missing job ID, cannot finalize job');
			return;
		}

		await updateBackgroundJobStatus(jobId, status, null, jobRequestorUserId, logger);
	}
}
