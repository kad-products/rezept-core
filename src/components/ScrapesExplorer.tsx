'use client';
import { dump } from 'js-yaml';
import { get } from 'object-path';
import { useState } from 'react';
import type { Permission, RecipeScrapeDBReadEnriched, RecipeScrapeSource, RzTableColumn } from '@/types';
import { findRecipeNode } from '@/utils';
import { RzTable } from './design-system';

export default function ScrapesExplorer({
	userPermissions,
	scrapes,
}: {
	userPermissions: Permission[];
	scrapes: RecipeScrapeDBReadEnriched[];
}): React.ReactNode {
	const [viewPath, setViewPath] = useState<string | undefined>(undefined);
	const columns: RzTableColumn[] = [
		{
			key: 'Source URL',
			label: 'Source URL',
			render: (_: string, row: Record<string, unknown>): string => (row?.source as RecipeScrapeSource)?.url || '',
		},
		{ key: 'searchedPath', label: 'Searched Path', render: (val: string): React.ReactNode => <pre>{val}</pre> },
		{
			key: 'actions',
			label: 'Actions',
			actions: [{ type: 'link', hrefProp: 'viewUrl', label: 'View', requiredPermission: 'recipes:read' }],
		},
	];

	// console.log(scrapes[0].source);

	const withPath = scrapes.map(s => {
		const source = s.source as RecipeScrapeSource;
		const recipeNode = findRecipeNode(source.jsonld);
		return {
			...s,
			recipeNode,
			searchedPath: viewPath && recipeNode ? dump(get(recipeNode, viewPath || '')) : '',
		};
	});

	const handleChange = (path: string): void => {
		setViewPath(path);
	};

	return (
		<>
			<input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>): void => handleChange(e.target.value)} />
			<RzTable userPermissions={userPermissions} columns={columns} data={withPath} />
		</>
	);
}
