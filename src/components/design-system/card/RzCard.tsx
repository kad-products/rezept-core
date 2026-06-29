import type { RzLink as RzLinkType } from '@/types';
import RzLink from '../link/RzLink';

export default function RzCard({
	title,
	body,
	actions,
}: {
	title: string;
	body?: string | React.ReactNode;
	actions: RzLinkType[];
}): React.ReactNode {
	return (
		<div className="rz-card">
			<div className="rz-card-title">{title}</div>
			{body && <div className="rz-card-body">{body}</div>}
			<div className="rz-card-actions">
				{actions.map(a => {
					return <RzLink key={a.href} {...a} />;
				})}
			</div>
		</div>
	);
}
