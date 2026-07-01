import type { Permission, RzLink as RzLinkType } from '@/types';
import RzLink from '../link/RzLink';

export default function RzCard({
	title,
	body,
	actions,
	userPermissions,
}: {
	title: string;
	body?: string | React.ReactNode;
	actions: RzLinkType[];
	userPermissions: Permission[];
}): React.ReactNode {
	return (
		<div className="rz-card">
			<div className="rz-card-title">{title}</div>
			{body && <div className="rz-card-body">{body}</div>}
			<div className="rz-card-actions">
				{actions.map(a => {
					return <RzLink key={a.href} userPermissions={userPermissions} {...a} />;
				})}
			</div>
		</div>
	);
}
