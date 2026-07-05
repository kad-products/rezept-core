import { ArchiveIcon, ColorWheelIcon, CookieIcon, EnterIcon, ExitIcon, HomeIcon, PersonIcon } from '@radix-ui/react-icons';
import type { NavItem, Permission } from '@/types';

export const navItems: Record<string, NavItem[]> = {
	recipes: [
		{
			key: 'recipes',
			href: '/recipes',
			label: 'Recipes',
			requiredPermission: 'recipes:read',
		},
		{
			key: 'uploads',
			href: '/recipes/uploads',
			label: 'Uploads',
			requiredPermission: 'recipes:upload',
		},
		{
			key: 'scrapes',
			href: '/recipes/scrapes',
			label: 'Scrapes',
			requiredPermission: 'recipes:scrape',
		},
	],
	profile: [
		{
			key: 'profile',
			href: '/profile',
			label: 'Profile',
			requiredPermission: 'profile:read',
		},
		{
			key: 'scrape-bookmarklet',
			href: '/profile/scrape-bookmarklet',
			label: 'Scrape Bookmarklet',
			requiredPermission: 'recipes:scrape',
		},
		{
			key: 'permissions',
			href: '/profile/permissions',
			label: 'Permissions',
			requiredPermission: 'permissions:override',
		},
		{
			key: 'api-keys',
			href: '/profile/api-keys',
			label: 'API Keys',
			requiredPermission: 'api-keys:read',
		},
		{
			key: 'passkeys',
			href: '/profile/passkeys',
			label: 'Passkeys / WebAuthn Credentials',
			requiredPermission: 'credentials:read',
		},
	],
	main: [
		{ key: 'home', label: 'Home', href: '/', icon: HomeIcon, requiredPermission: '__controls:read' },
		{
			key: 'seasons',
			label: 'Seasons',
			href: '/seasons',
			icon: ColorWheelIcon,
			requiredPermission: 'seasons:read',
		},
		{
			key: 'recipes',
			label: 'Recipes',
			href: '/recipes',
			icon: ArchiveIcon,
			requiredPermission: 'recipes:read',
		},
		{
			key: 'profile',
			label: 'Profile',
			href: '/profile',
			icon: PersonIcon,
			requiredPermission: 'profile:read',
		},
		{
			key: 'login',
			label: 'Login',
			href: '/auth/login',
			icon: EnterIcon,
			requiredPermission: 'auth:login',
			basePage: 'auth',
		},
		{
			key: 'logout',
			label: 'Logout',
			href: '/auth/logout',
			icon: ExitIcon,
			requiredPermission: 'auth:logout',
			basePage: 'auth',
		},
	],
	admin: [
		{ key: 'admin-home', label: 'Admin Home', href: '/admin', icon: HomeIcon, requiredPermission: 'admin:read' },
		{
			key: 'users',
			label: 'Users',
			href: '/admin/users',
			icon: PersonIcon,
			requiredPermission: 'users:read',
			basePage: 'users',
		},
		{
			key: 'ingredients',
			label: 'Ingredients',
			href: '/admin/ingredients',
			icon: CookieIcon,
			requiredPermission: 'ingredients:read',
			basePage: 'ingredients',
		},
		{
			key: 'scrapes',
			label: 'Scrapes',
			href: '/admin/recipes/scrapes',
			icon: ArchiveIcon,
			requiredPermission: 'recipes:read',
			basePage: 'recipes',
		},
		{
			key: 'logout',
			label: 'Logout',
			href: '/auth/logout',
			icon: ExitIcon,
			requiredPermission: 'auth:logout',
			basePage: 'auth',
		},
	],
};

export function getNavItems(navType: keyof typeof navItems, userPerms: Permission[] = []): NavItem[] {
	const typeNavItems = navItems[navType];
	return typeNavItems.filter(i => {
		if (!userPerms?.includes(i.requiredPermission)) {
			return false;
		}
		return true;
	});
}
