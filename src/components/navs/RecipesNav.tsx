import { getNavItems } from '@/data/navigation';
import type { Permission } from '@/types';
import { RzLeftNav } from '../design-system';

export default function RecipesNav({ userPerms }: { userPerms: Permission[] | undefined }): React.ReactNode {
	const recipesNavItems = getNavItems('recipes', userPerms);
	return <RzLeftNav navItems={recipesNavItems} />;
}
