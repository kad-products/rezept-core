import { desc, eq, sql } from 'drizzle-orm';
import db from '@/db';
import type RzLogger from '@/logger';
import { backgroundJobs } from '@/models';
import type { BackgroundJobDBRead, BackgroundJobStatus } from '@/types';

export async function createBackgroundJob(name: string, userId: string, logger: RzLogger): Promise<BackgroundJobDBRead> {
	logger.debug(`Creating background job: ${name}`);

	const [job] = await db
		.insert(backgroundJobs)
		.values({
			name,
			createdBy: userId,
		})
		.returning();

	logger.info(`Created background job ${job.id} (${name})`);
	return job;
}

export async function updateBackgroundJobStatus(
	id: string,
	status: BackgroundJobStatus,
	notes: string | null,
	userId: string,
	logger: RzLogger,
): Promise<BackgroundJobDBRead> {
	logger.debug(`Updating background job ${id} status to ${status}`);

	const terminalStatuses: BackgroundJobStatus[] = ['COMPLETED', 'FAILED'];
	const completedAt = terminalStatuses.includes(status) ? new Date().toISOString() : undefined;

	const [job] = await db
		.update(backgroundJobs)
		.set({
			status,
			notes,
			completedAt,
			updatedAt: sql`(datetime('now', 'localtime'))`,
			updatedBy: userId,
		})
		.where(eq(backgroundJobs.id, id))
		.returning();

	logger.info(`Updated background job ${id} status to ${status}`);
	return job;
}

export async function getLatestBackgroundJobByName(name: string, logger: RzLogger): Promise<BackgroundJobDBRead | null> {
	logger.debug(`Fetching latest background job: ${name}`);

	const [job] = await db
		.select()
		.from(backgroundJobs)
		.where(eq(backgroundJobs.name, name))
		.orderBy(desc(backgroundJobs.createdAt))
		.limit(1);

	if (!job) {
		logger.debug(`No background job found for: ${name}`);
		return null;
	}

	logger.debug(`Fetched background job ${job.id} (${name})`);
	return job;
}
