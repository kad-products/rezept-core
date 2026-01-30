import type { RequestInfo } from 'rwsdk/worker';
import GetUserCredentials from '@/components/server/GetUserCredentials';
import StandardLayout from '@/layouts/standard';

export default function Pages__profile__root({ ctx }: RequestInfo) {
	return (
		<StandardLayout currentBasePage="profile" pageTitle="Profile" ctx={ctx}>
			<div><pre>
				{JSON.stringify(ctx, null, 2)}
			</pre></div>
			<GetUserCredentials userId={ctx.user?.id} />
		</StandardLayout>
	);
}
