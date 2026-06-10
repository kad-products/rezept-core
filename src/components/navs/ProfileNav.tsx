import { getNavItems } from '@/data/navigation';
import type { Permission } from '@/types';
import { RzLeftNav } from '../design-system';

export default function ProfileNav({ userPerms }: { userPerms: Permission[] | undefined }): React.ReactNode {
	const profileNavItems = getNavItems('profile', userPerms);
	return <RzLeftNav navItems={profileNavItems} />;
}
