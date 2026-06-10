'use client';
import { Menubar } from 'radix-ui';

export default function AdminMenubar(): React.ReactNode {
	return (
		<Menubar.Root>
			<Menubar.Menu>
				<Menubar.Trigger>Users</Menubar.Trigger>
				<Menubar.Portal>
					<Menubar.Content>
						<Menubar.Item asChild>
							<a href="/admin/users">Manage Users</a>
						</Menubar.Item>
					</Menubar.Content>
				</Menubar.Portal>
			</Menubar.Menu>
		</Menubar.Root>
	);
}
