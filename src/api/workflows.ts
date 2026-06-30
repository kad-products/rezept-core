import { env } from 'cloudflare:workers';
import type { RequestInfo } from 'rwsdk/worker';
import { apiErrorResponse, successResponse } from '@/api/utils';
import { requireAuthentication, requirePermissions } from '@/interrupters';

export default {
	post: [requireAuthentication, requirePermissions('workflows:run'), _postHandler] as const,
};

/**
 * @private - exported for testing only, do not use directly
 */
export async function _postHandler({ params, ctx }: RequestInfo): Promise<Response> {
	const workflowName = params.workflowName;

	ctx.logger.debug(`Running workflow ${workflowName}`);

	try {
		switch (workflowName) {
			case 'recipe-raw-ingredients-to-ingredients': {
				// biome-ignore lint/style/noNonNullAssertion: guaranteed by requireAuthentication in serverAction chain
				const userId = ctx.user!.id;
				const workflowInstance = await env.RECIPE_RAW_INGREDIENTS_TO_INGREDIENTS_WORKFLOW.create({
					params: {
						...params,
						userId,
					},
				});
				return successResponse(workflowInstance);
			}
			default:
				throw new Error(`Workflow ${workflowName} is not valid, please check the name in your request and try again`);
		}
	} catch (err) {
		return apiErrorResponse(err, 'Error running the workflow');
	}
}
