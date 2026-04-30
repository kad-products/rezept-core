import { getRequestInfo } from 'rwsdk/worker';

export function requireAuthentication(): Response | undefined {
	const { ctx } = getRequestInfo();
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
