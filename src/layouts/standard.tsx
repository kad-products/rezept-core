import { ArchiveIcon, ColorWheelIcon, EnterIcon, ExitIcon, HomeIcon, PersonIcon } from '@radix-ui/react-icons';
import classNames from 'classnames';
import { StrictMode } from 'react';
import type { DefaultAppContext } from 'rwsdk/worker';
import RzLogger from '@/logger';

type NavItem = {
	label: string;
	href: string;
	icon: React.ComponentType;
	permCheck?: (permissions: string[]) => boolean;
	basePage?: string; // Optional base page for active state
};

export default function StandardLayout({
	children,
	currentBasePage,
	pageTitle,
	ctx = {
		logger: new RzLogger(),
	},
}: {
	children: React.ReactNode;
	currentBasePage: string | undefined;
	pageTitle: string;
	ctx: DefaultAppContext;
}) {
	const navItems: Record<string, NavItem> = {
		home: { label: 'Home', href: '/', icon: HomeIcon },
		seasons: { label: 'Seasons', href: '/seasons', icon: ColorWheelIcon, permCheck: (p: string[]) => p.includes('seasons:read') },
		recipes: { label: 'Recipes', href: '/recipes', icon: ArchiveIcon, permCheck: (p: string[]) => p.includes('recipes:read') },
		profile: { label: 'Profile', href: '/profile', icon: PersonIcon, permCheck: (p: string[]) => p.includes('profile:read') },
		login: {
			label: 'Login',
			href: '/auth/login',
			icon: EnterIcon,
			permCheck: (p: string[]) => p.includes('auth:login'),
			basePage: 'auth',
		},
		logout: {
			label: 'Logout',
			href: '/auth/logout',
			icon: ExitIcon,
			permCheck: (p: string[]) => p.includes('auth:logout'),
			basePage: 'auth',
		},
	};

	const userPerms = ctx.permissions || [];

	// Filter nav items based on permissions
	const filteredNavItems = Object.entries(navItems)
		.filter(([_, item]) => {
			if (!item.permCheck) return true; // No permission check means it's always visible
			return item.permCheck(userPerms);
		})
		.map(([key, item]) => ({ ...item, key }));

	return (
		<StrictMode>
			<header>
				<nav className="main-nav">
					{filteredNavItems.map(item => {
						const Icon = item.icon;
						return (
							<a
								key={item.key}
								className={classNames({
									'nav-item': true,
									'nav-item-active': currentBasePage === item.key,
								})}
								href={item.href}
							>
								<span className="nav-item-icon">
									<Icon />
								</span>
								<span className="nav-item-label">{item.label}</span>
							</a>
						);
					})}
				</nav>
			</header>
			<main>
				<h2 className="page-title">{pageTitle}</h2>
				{children}
			</main>
		</StrictMode>
	);
}
