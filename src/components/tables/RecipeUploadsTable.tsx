'use client';
import { RzTable } from '@/components/design-system';
import type { Permission, RecipeUploadDBRead, RzTableColumn } from '@/types';

export default function RecipeUploadsTable({
	recipeUploads,
	userPermissions,
}: {
	recipeUploads: RecipeUploadDBRead[];
	userPermissions: Permission[];
}): React.ReactNode {
	const rows = recipeUploads.map(u => ({ ...u, editUrl: `/recipes/uploads/${u.id}` }));
	const recipeUploadColumns: RzTableColumn[] = [
		{ label: 'ID', key: 'id' },
		{ label: 'Filename', key: 'originalFilename' },
		{ label: 'MIME Type', key: 'mimeType' },
		{ label: 'File Size', key: 'fileSize' },
		{ label: 'Status', key: 'status' },
		{ label: 'Created At', key: 'createdAt' },
		{
			key: 'actions',
			label: 'Actions',
			actions: [{ type: 'link', hrefProp: 'editUrl', label: 'Edit', requiredPermission: 'recipes:upload' }],
		},
	];

	return <RzTable columns={recipeUploadColumns} userPermissions={userPermissions} data={rows} rowIndex="id" />;
}
