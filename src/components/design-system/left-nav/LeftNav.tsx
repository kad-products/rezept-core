import type { RzLink as RzLinkType } from '@/types';
import RzLink from '../link/RzLink';

export default function RzLeftNav({ navItems }: { navItems: RzLinkType[] }): React.ReactNode {
	return (
		<nav className="rz-left-nav">
			<ul>
				{navItems.map(item => (
					<li key={item.href}>
						<RzLink {...item} />
					</li>
				))}
			</ul>
		</nav>
	);
}
