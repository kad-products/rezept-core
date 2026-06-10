type NavItem = {
	href: string;
	label: string;
};

export default function RzLeftNav({ navItems }: { navItems: NavItem[] }): React.ReactNode {
	return (
		<nav className="rz-left-nav">
			<ul>
				{navItems.map(item => (
					<li key={item.href}>
						<a href={item.href}>{item.label}</a>
					</li>
				))}
			</ul>
		</nav>
	);
}
