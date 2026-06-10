import type { RequestInfo } from 'rwsdk/worker';
import ProfileNav from '@/components/navs/ProfileNav';
import AppLayout from '@/layouts/app';

export default async function Pages__profile__root({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	return (
		<AppLayout currentBasePage="profile" pageTitle="Profile" ctx={ctx} leftNav={<ProfileNav userPerms={ctx.permissions} />}>
			<h2>Profile Info</h2>
			<ul>
				<li>ID: {ctx.user?.id}</li>
				<li>Username: {ctx.user?.username}</li>
				<li>Roles: {ctx.user?.role}</li>
				<li>Created: {ctx.user?.createdAt}</li>
			</ul>
		</AppLayout>
	);
}
