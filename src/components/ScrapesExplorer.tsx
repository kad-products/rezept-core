'use client';
import { get } from 'object-path';
import { useState } from 'react';
import { createReactLogger } from '@/logger-react';
import { scrapeExtractRecipeNode } from '@/steps';
import type { Permission, RecipeScrapeDBReadEnriched, RecipeScrapeSource, RzTableColumn } from '@/types';
import { RzTable } from './design-system';

export default function ScrapesExplorer({
	userPermissions,
	scrapes,
}: {
	userPermissions: Permission[];
	scrapes: RecipeScrapeDBReadEnriched[];
}): React.ReactNode {
	const logger = createReactLogger();
	const [viewPath, setViewPath] = useState<string | undefined>(undefined);
	const columns: RzTableColumn[] = [
		{
			key: 'Source URL',
			label: 'Source URL',
			render: (_: string, row: Record<string, unknown>): string => (row?.source as RecipeScrapeSource)?.url || '',
		},
		{ key: 'searchedPath', label: 'Searched Path' },
		{
			key: 'actions',
			label: '',
			actions: [{ type: 'link', hrefProp: 'viewUrl', label: 'View', requiredPermission: 'recipes:read' }],
		},
	];

	// console.log(scrapes[0].source);

	const withPath = scrapes.map(s => {
		const source = s.source as RecipeScrapeSource;
		const recipeNode = scrapeExtractRecipeNode(source.jsonld, logger);
		return {
			...s,
			recipeNode,
			searchedPath: viewPath && recipeNode ? JSON.stringify(get(recipeNode, viewPath || '')) : '',
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
