import type { Permission } from '@/types';

export type RzLink = {
	href: string;
	label: string;
	requiredPermission?: Permission;
} & React.ComponentPropsWithoutRef<'a'>;
