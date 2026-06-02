import type { RequestInfo } from 'rwsdk/worker';
import AppLayout from '@/layouts/app';

export default function NotFound({ ctx }: RequestInfo): React.JSX.Element {
	return (
		<AppLayout currentBasePage={undefined} pageTitle="Page not found" ctx={ctx}>
			<p>The page you were looking for doesn't exist.</p>
		</AppLayout>
	);
}
