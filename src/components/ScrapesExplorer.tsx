'use client';
import { get } from 'object-path';
import { useState } from 'react';
import type { Permission, RecipeScrapeDBReadEnriched, RecipeScrapeJsonLdNode, RecipeScrapeSource, RzTableColumn } from '@/types';
import { RzTable } from './design-system';

function isRecipeNode(node: RecipeScrapeJsonLdNode): boolean {
	const type = node['@type'];
	return Array.isArray(type) ? type.includes('Recipe') : type === 'Recipe';
}

function findRecipeNode(jsonld: unknown[]): RecipeScrapeJsonLdNode | null {
	for (const item of jsonld) {
		if (!item || typeof item !== 'object') continue;
		const node = item as RecipeScrapeJsonLdNode;

		// Handle @graph wrapper
		if (Array.isArray(node['@graph'])) {
			const found = findRecipeNode(node['@graph'] as unknown[]);
			if (found) return found;
		}

		// Handle nested arrays (as sent by the bookmarklet)
		if (Array.isArray(item)) {
			const found = findRecipeNode(item as unknown[]);
			if (found) return found;
		}

		if (isRecipeNode(node)) return node;
	}
	return null;
}

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
		const recipeNode = findRecipeNode(source.jsonld);
		return {
			...s,
			recipeNode,
			searchedPath: viewPath && recipeNode ? JSON.stringify(get(recipeNode, viewPath || '')) : '',
		};
	});

	const handleChange = (path: string): void => {
		setViewPath(path);
	};

	console.log(withPath[0].recipeNode);

	return (
		<>
			<input type="text" onChange={(e: React.ChangeEvent<HTMLInputElement>): void => handleChange(e.target.value)} />
			<RzTable userPermissions={userPermissions} columns={columns} data={withPath} />
		</>
	);
}
