import type { RequestInfo } from 'rwsdk/worker';
import AdminLayout from '@/layouts/admin';

export default function Pages__admin__index({ ctx }: RequestInfo): React.JSX.Element {
	return <AdminLayout pageTitle="Admin">Welcome, {ctx.user?.username}.</AdminLayout>;
}
