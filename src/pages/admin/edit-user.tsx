import type { RequestInfo } from 'rwsdk/worker';
import UserForm from '@/forms/user';
import AdminLayout from '@/layouts/admin';
import { getUserById } from '@/repositories';

export default async function Pages__admin__editUser({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const user = await getUserById(params.userId, ctx.logger);

	return (
		<AdminLayout pageTitle={`Edit ${user.username}`}>
			<nav className="in-page-nav">
				<a href="/admin/users">Users</a>
			</nav>
			<UserForm user={user} />
		</AdminLayout>
	);
}
