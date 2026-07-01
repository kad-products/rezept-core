import type { Permission, RzLink as RzLinkType } from '@/types';

export default function RzLink({
	label,
	requiredPermission,
	userPermissions,
	...other
}: {
	userPermissions: Permission[];
} & RzLinkType): React.ReactNode {
	if (!userPermissions?.includes(requiredPermission)) {
		return null;
	}
	return <a {...other}>{label}</a>;
}
