import { RzTable } from '@/components/design-system';
import type { Permission, RzTableColumn } from '@/types';

export default function UserPermissionsTable({
	permissionsList,
	userPermissions,
}: {
	permissionsList: string[];
	userPermissions: Permission[];
}): React.ReactNode {
	const permissionEntities = new Set(permissionsList.map(permissionString => permissionString.split(':')[0]));
	const permissionsData = [...permissionEntities].map(entity => {
		const entityPermissions = permissionsList
			.filter(permissionString => permissionString.startsWith(`${entity}:`))
			.map(permissionString => permissionString.split(':')[1])
			.join(', ');
		return {
			permissionsKey: `${entity}:${entityPermissions}`,
			entity,
			permissions: entityPermissions,
		};
	});

	const permissionsColumns: RzTableColumn[] = [
		{ label: 'Entity', key: 'entity' },
		{ label: 'Permissions', key: 'permissions' },
	];

	return (
		<RzTable userPermissions={userPermissions} columns={permissionsColumns} data={permissionsData} rowIndex="permissionsKey" />
	);
}
