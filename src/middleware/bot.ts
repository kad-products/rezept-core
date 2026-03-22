import type { DefaultAppContext, RequestInfo } from 'rwsdk/worker';

export default function botMiddleware({ request }: RequestInfo<DefaultAppContext>) {
	// this is not actually a bot, it is just react devtools
	if (request.url.toLowerCase().includes('installhook.js.map')) {
		return Response.json(
			{
				success: false,
				message: 'Bot protection',
			},
			{
				status: 405,
			},
		);
	}
}
