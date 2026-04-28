import type { RequestInfo } from 'rwsdk/worker';

import StandardLayout from '@/layouts/standard';

export default function Pages__root({ ctx }: RequestInfo): React.JSX.Element {
	return (
		<StandardLayout currentBasePage="home" pageTitle="Home" ctx={ctx}>
			oh hai
		</StandardLayout>
	);
}
