import type { Permission } from './permissions';

export type NavItem = {
	key: string;
	label: string;
	href: string;
	icon?: React.ComponentType;
	permCheck: (permissions: Permission[]) => boolean;
	basePage?: string;
};
