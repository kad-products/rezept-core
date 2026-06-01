import type { RequestInfo } from 'rwsdk/worker';

import AppLayout from '@/layouts/app';

export default function Pages__root({ ctx }: RequestInfo): React.JSX.Element {
	return (
		<AppLayout currentBasePage="home" pageTitle="Home" ctx={ctx}>
			oh hai
		</AppLayout>
	);
}
