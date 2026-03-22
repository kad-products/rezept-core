import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';

export function requireAuthentication({ ctx }: RequestInfo<DefaultAppContext>) {
	if (!ctx.user) {
		return Response.json(
			{
				error: 'Unauthorized',
				message: 'Authentication is required for this action',
			},
			{ status: 401 },
		);
	}
}
