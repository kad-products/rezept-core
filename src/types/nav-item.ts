export type NavItem = {
	key: string;
	label: string;
	href: string;
	icon?: React.ComponentType;
	permCheck?: (permissions: string[]) => boolean;
	basePage?: string;
};
