'use client';
import { HamburgerMenuIcon } from '@radix-ui/react-icons';
import { DropdownMenu } from 'radix-ui';
import type { Permission } from '@/types';
import styleClasses from './rz-pop-menu.module.css';

type Link = {
	label: string;
	requiredPermission?: Permission;
} & React.ComponentPropsWithoutRef<'a'>;

export default function RzPopMenu({
	items,
	permissions,
}: {
	items: Link[];
	permissions?: Permission[];
} & React.ComponentPropsWithoutRef<'a'>): React.ReactNode {
	const permittedItems = items.filter(i => {
		if (i.requiredPermission && !permissions?.includes(i.requiredPermission)) {
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
						const { label, requiredPermission, ...other } = i;
						return (
							<DropdownMenu.Item key={i.label} className="rz-pop-menu-item" asChild>
								<a {...other}>{label}</a>
							</DropdownMenu.Item>
						);
					})}
				</DropdownMenu.Content>
			</DropdownMenu.Portal>
		</DropdownMenu.Root>
	);
}
