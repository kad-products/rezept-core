import type { RequestInfo } from 'rwsdk/worker';
import AdminLayout from '@/layouts/admin';

export default function AdminNotFound({ ctx }: RequestInfo): React.JSX.Element {
	return (
		<AdminLayout currentBasePage={undefined} pageTitle="Page not found" ctx={ctx}>
			<p>The admin page you were looking for doesn't exist.</p>
		</AdminLayout>
	);
}
