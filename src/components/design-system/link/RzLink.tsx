import type { Permission } from '@/types';

export default function RzLink({
	label,
	permissions,
	requiredPermission,
	...other
}: {
	label: string;
	permissions?: Permission[];
	requiredPermission?: Permission;
} & React.ComponentPropsWithoutRef<'a'>): React.ReactNode {
	if (requiredPermission && !permissions?.includes(requiredPermission)) {
		return null;
	}
	return <a {...other}>{label}</a>;
}
