'use client';
import { RzTable } from '@/components/design-system';
import type { RecipeScrapeDBRead, RzTableColumn } from '@/types';

export default function RecipeScrapesTable({ recipeScrapes }: { recipeScrapes: RecipeScrapeDBRead[] }): React.ReactNode {
	const rows = recipeScrapes.map(u => ({ ...u, editUrl: `/recipes/scrapes/${u.id}` }));
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
			actions: [{ type: 'link', hrefProp: 'editUrl', label: 'Edit', requiredPermission: 'recipes:scrape' }],
		},
	];

	return <RzTable columns={recipeUploadColumns} data={rows} rowIndex="id" />;
}
