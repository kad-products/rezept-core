'use client';
import { RzTable } from '@/components/design-system';
import type { RecipeScrapeDBRead, RzTableColumn } from '@/types';

export default function RecipeScrapesTable({ recipeScrapes }: { recipeScrapes: RecipeScrapeDBRead[] }): React.ReactNode {
	const recipeUploadColumns: RzTableColumn[] = [
		{ label: 'ID', key: 'id' },
		{ label: 'Filename', key: 'originalFilename' },
		{ label: 'MIME Type', key: 'mimeType' },
		{ label: 'File Size', key: 'fileSize' },
		{ label: 'Status', key: 'status' },
		{ label: 'Created At', key: 'createdAt' },
		{ key: 'editUrl', label: 'Actions', actions: [{ type: 'link', hrefProp: 'editUrl', label: 'Edit' }] },
	];

	return <RzTable columns={recipeUploadColumns} data={recipeScrapes} rowIndex="id" />;
}
