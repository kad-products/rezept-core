import { ArchiveIcon, ColorWheelIcon, EnterIcon, ExitIcon, HomeIcon, PersonIcon } from '@radix-ui/react-icons';
import type { NavItem, Permission } from '@/types';

const navItems: Record<string, NavItem[]> = {
	recipes: [
		{
			key: 'recipes',
			href: '/recipes',
			label: 'Recipes',
		},
		{
			key: 'uploads',
			href: '/recipes/uploads',
			label: 'Uploads',
		},
		{
			key: 'scrapes',
			href: '/recipes/scrapes',
			label: 'Scrapes',
		},
	],
	profile: [
		{
			key: 'profile',
			href: '/profile',
			label: 'Profile',
		},
		{
			key: 'scrape-bookmarklet',
			href: '/profile/scrape-bookmarklet',
			label: 'Scrape Bookmarklet',
		},
		{
			key: 'permissions',
			href: '/profile/permissions',
			label: 'Permissions',
		},
		{
			key: 'api-keys',
			href: '/profile/api-keys',
			label: 'API Keys',
		},
		{
			key: 'passkeys',
			href: '/profile/passkeys',
			label: 'Passkeys / WebAuthn Credentials',
		},
	],
	main: [
		{ key: 'home', label: 'Home', href: '/', icon: HomeIcon },
		{
			key: 'seasons',
			label: 'Seasons',
			href: '/seasons',
			icon: ColorWheelIcon,
			permCheck: (p: string[]) => p.includes('seasons:read'),
		},
		{
			key: 'recipes',
			label: 'Recipes',
			href: '/recipes',
			icon: ArchiveIcon,
			permCheck: (p: string[]) => p.includes('recipes:read'),
		},
		{
			key: 'profile',
			label: 'Profile',
			href: '/profile',
			icon: PersonIcon,
			permCheck: (p: string[]) => p.includes('profile:read'),
		},
		{
			key: 'login',
			label: 'Login',
			href: '/auth/login',
			icon: EnterIcon,
			permCheck: (p: string[]) => p.includes('auth:login'),
			basePage: 'auth',
		},
		{
			key: 'logout',
			label: 'Logout',
			href: '/auth/logout',
			icon: ExitIcon,
			permCheck: (p: string[]) => p.includes('auth:logout'),
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
