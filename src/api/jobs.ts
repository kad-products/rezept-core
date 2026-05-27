import { env } from 'cloudflare:workers';
import type { RequestInfo } from 'rwsdk/worker';
import { errorResponse, successResponse } from '@/api/utils';
import { requireAuthentication, requirePermissions } from '@/interrupters';
import { backgroundJobName } from '@/models';
import { createBackgroundJob, getLatestBackgroundJobByName } from '@/repositories';

export default {
	get: [requireAuthentication, requirePermissions('jobs:read'), _getHandler] as const,
	post: [requireAuthentication, requirePermissions('jobs:trigger'), _postHandler] as const,
};

/**
 * @private - exported for testing only, do not use directly
 */
export async function _getHandler({ params, ctx }: RequestInfo): Promise<Response> {
	const jobName = params.jobName;

	const job = await getLatestBackgroundJobByName(jobName, ctx.logger);

	if (!job) {
		return errorResponse(`No jobs found for: ${jobName}`, 404);
	}
	const doId = env.JOB_DURABLE_OBJECT.idFromName(job.id);
	const jobDurableObject = env.JOB_DURABLE_OBJECT.get(doId);
	const totalCount = await jobDurableObject.getTotalCount();

	return successResponse({ job, do: { totalCount, id: doId.toString() } });
}

/**
 * @private - exported for testing only, do not use directly
 */
export async function _postHandler({ params, ctx }: RequestInfo): Promise<Response> {
	const jobName = params.jobName;

	if (!(backgroundJobName as readonly string[]).includes(jobName)) {
		return errorResponse(`Unknown job: ${jobName}`, 404);
	}

	// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication interrupter
	const userId = ctx.user!.id;

	const job = await createBackgroundJob(jobName, userId, ctx.logger);

	const doId = env.JOB_DURABLE_OBJECT.idFromName(job.id);
	const jobDurableObject = env.JOB_DURABLE_OBJECT.get(doId);
	await jobDurableObject.initialize(userId);

	return successResponse({ job, do: { id: doId.toString() } }, 201);
}
