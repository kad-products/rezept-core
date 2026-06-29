import type { Permission, RzLink as RzLinkType } from '@/types';
import RzLink from '../link/RzLink';

export default function RzLeftNav({
	navItems,
}: {
	navItems: (RzLinkType & { permCheck?: (p: Permission[]) => boolean })[];
}): React.ReactNode {
	return (
		<nav className="rz-left-nav">
			<ul>
				{navItems.map(item => {
					const { permCheck, ...other } = item;
					return (
						<li key={item.href}>
							<RzLink key={other.href} {...other} />
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
