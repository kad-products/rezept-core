import { ArchiveIcon, ColorWheelIcon, EnterIcon, ExitIcon, HomeIcon, PersonIcon } from '@radix-ui/react-icons';
import type { NavItem, Permission } from '@/types';

const navItems: Record<string, NavItem[]> = {
	recipes: [
		{
			key: 'recipes',
			href: '/recipes',
			label: 'Recipes',
			permCheck: (p: Permission[]) => p.includes('recipes:read'),
		},
		{
			key: 'uploads',
			href: '/recipes/uploads',
			label: 'Uploads',
			permCheck: (p: Permission[]) => p.includes('recipes:upload'),
		},
		{
			key: 'scrapes',
			href: '/recipes/scrapes',
			label: 'Scrapes',
			permCheck: (p: Permission[]) => p.includes('recipes:scrape'),
		},
	],
	profile: [
		{
			key: 'profile',
			href: '/profile',
			label: 'Profile',
			permCheck: (p: Permission[]) => p.includes('profile:read'),
		},
		{
			key: 'scrape-bookmarklet',
			href: '/profile/scrape-bookmarklet',
			label: 'Scrape Bookmarklet',
			permCheck: (p: Permission[]) => p.includes('recipes:scrape'),
		},
		{
			key: 'permissions',
			href: '/profile/permissions',
			label: 'Permissions',
			permCheck: (p: Permission[]) => p.includes('permissions:override'),
		},
		{
			key: 'api-keys',
			href: '/profile/api-keys',
			label: 'API Keys',
			permCheck: (p: Permission[]) => p.includes('api-keys:read'),
		},
		{
			key: 'passkeys',
			href: '/profile/passkeys',
			label: 'Passkeys / WebAuthn Credentials',
			permCheck: (p: Permission[]) => p.includes('credentials:read'),
		},
	],
	main: [
		// yes a silly permCheck like the below is dumb and has a tiny CPU cost but
		// it allows us to just make the NavItem type require a permCheck which we
		// want on every other nav item in the site
		{ key: 'home', label: 'Home', href: '/', icon: HomeIcon, permCheck: () => true },
		{
			key: 'seasons',
			label: 'Seasons',
			href: '/seasons',
			icon: ColorWheelIcon,
			permCheck: (p: Permission[]) => p.includes('seasons:read'),
		},
		{
			key: 'recipes',
			label: 'Recipes',
			href: '/recipes',
			icon: ArchiveIcon,
			permCheck: (p: Permission[]) => p.includes('recipes:read'),
		},
		{
			key: 'profile',
			label: 'Profile',
			href: '/profile',
			icon: PersonIcon,
			permCheck: (p: Permission[]) => p.includes('profile:read'),
		},
		{
			key: 'login',
			label: 'Login',
			href: '/auth/login',
			icon: EnterIcon,
			permCheck: (p: Permission[]) => p.includes('auth:login'),
			basePage: 'auth',
		},
		{
			key: 'logout',
			label: 'Logout',
			href: '/auth/logout',
			icon: ExitIcon,
			permCheck: (p: Permission[]) => p.includes('auth:logout'),
			basePage: 'auth',
		},
	],
};

export function getNavItems(navType: keyof typeof navItems, userPerms: Permission[] = []): NavItem[] {
	const typeNavItems = navItems[navType];
	return typeNavItems.filter(item => {
		if (!item.permCheck) return true; // No permission check means it's always visible
		return item.permCheck(userPerms);
	});
}
