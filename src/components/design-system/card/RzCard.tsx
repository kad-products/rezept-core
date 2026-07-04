import type { Permission, RzLink as RzLinkType } from '@/types';
import RzLink from '../link/RzLink';
import styleClasses from './rz-card.module.css';

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
		<div className={styleClasses.rzCard}>
			<div className={styleClasses.rzCardTitle}>{title}</div>
			{body && <div className={styleClasses.rzCardBody}>{body}</div>}
			<div className={styleClasses.rzCardActions}>
				{actions.map(a => {
					return <RzLink key={a.href} userPermissions={userPermissions} {...a} />;
				})}
			</div>
		</div>
	);
}
