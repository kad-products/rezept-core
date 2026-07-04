import type { Permission, RzLink as RzLinkType } from '@/types';
import RzLink from '../link/RzLink';
import styleClasses from './rz-left-nav.module.css';

export default function RzLeftNav({
	navItems,
	userPermissions,
}: {
	navItems: RzLinkType[];
	userPermissions: Permission[];
}): React.ReactNode {
	return (
		<nav className={styleClasses.rzLeftNav}>
			<ul>
				{navItems.map(item => {
					return (
						<li key={item.href}>
							<RzLink userPermissions={userPermissions} key={item.href} {...item} />
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
