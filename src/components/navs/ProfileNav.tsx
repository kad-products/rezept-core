import { RzLeftNav } from '../design-system';

export default function ProfileNav(): React.ReactNode {
	const profileNavItems = [
		{
			href: '/profile',
			label: 'Profile',
		},
		{
			href: '/profile/scrape-bookmarklet',
			label: 'Scrape Bookmarklet',
		},
		{
			href: '/profile/permissions',
			label: 'Permissions',
		},
		{
			href: '/profile/api-keys',
			label: 'API Keys',
		},
		{
			href: '/profile/passkeys',
			label: 'Passkeys / WebAuthn Credentials',
		},
	];
	return <RzLeftNav navItems={profileNavItems} />;
}
