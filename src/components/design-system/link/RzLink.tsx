import type { Permission, RzLink as RzLinkType } from '@/types';

export default function RzLink({
	label,
	requiredPermission,
	permissions,
	...other
}: {
	permissions?: Permission[];
} & RzLinkType): React.ReactNode {
	if (requiredPermission && !permissions?.includes(requiredPermission)) {
		return null;
	}
	return <a {...other}>{label}</a>;
}
