import type { RequestInfo } from 'rwsdk/worker';
import StandardLayout from '@/layouts/standard';

export default function NotFound({ ctx }: RequestInfo): React.JSX.Element {
	return (
		<StandardLayout currentBasePage={undefined} pageTitle="Page not found" ctx={ctx}>
			<p>The page you were looking for doesn't exist.</p>
		</StandardLayout>
	);
}
