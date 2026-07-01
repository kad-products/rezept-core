import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu } from '@/components/design-system';
import UserForm from '@/forms/user';
import AdminLayout from '@/layouts/admin';
import { getUserById } from '@/repositories';

export default async function Pages__admin__users__edit({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const user = await getUserById(params.userId, ctx.logger);

	return (
		<AdminLayout ctx={ctx} currentBasePage="users" pageTitle={`Edit ${user.username}`}>
			<RzPopMenu
				permissions={ctx.permissions}
				items={[
					{
						requiredPermission: 'users:read',
						label: 'Users',
						href: `/admin/users`,
					},
				]}
			/>
			<UserForm user={user} />
		</AdminLayout>
	);
}
