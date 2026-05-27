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

	return successResponse(job);
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

	return successResponse(job, 201);
}
