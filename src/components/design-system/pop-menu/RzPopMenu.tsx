'use client';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { DropdownMenu } from 'radix-ui';
import type { Permission, RzLink as RzLinkType } from '@/types';
import RzLink from '../link/RzLink';
import styleClasses from './rz-pop-menu.module.css';

export default function RzPopMenu({
	items,
	userPermissions,
}: {
	items: RzLinkType[];
	userPermissions: Permission[];
}): React.ReactNode {
	const permittedItems = items.filter(i => {
		if (i.requiredPermission && !userPermissions?.includes(i.requiredPermission)) {
			return false;
		}
		return true;
	});

	if (permittedItems.length === 0) {
		return null;
	}

	return (
		<DropdownMenu.Root>
			<DropdownMenu.Trigger className={styleClasses.rzPopMenu} asChild>
				<button type="button" className="rz-icon-button" aria-label="Menu Label">
					<HamburgerMenuIcon />
				</button>
			</DropdownMenu.Trigger>

			<DropdownMenu.Portal>
				<DropdownMenu.Content className="rz-pop-menu-content">
					{permittedItems.map(i => {
						const { key, ...rest } = i;
						return (
							<DropdownMenu.Item key={i.href} className="rz-pop-menu-item" asChild>
								<RzLink userPermissions={userPermissions} {...rest} />
							</DropdownMenu.Item>
						);
					})}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
