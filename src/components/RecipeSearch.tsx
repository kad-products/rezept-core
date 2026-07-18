'use client';
import { useState } from 'react';

import InSeasonRecipeSearchForm from '@/forms/in-season-recipe-search';
import type { Permission, RecipeDBRead } from '@/types';
import { RzLink } from './design-system';

export default function RecipeSearch({
	growingZoneOptions,
	monthOptions,
	userPermissions,
}: {
	growingZoneOptions: { value: string; label: string }[];
	monthOptions: { value: string; label: string }[];
	userPermissions: Permission[];
}): React.ReactNode {
	const [results, setResults] = useState<RecipeDBRead[]>([]);

	return (
		<div>
			<InSeasonRecipeSearchForm growingZoneOptions={growingZoneOptions} monthOptions={monthOptions} setResults={setResults} />
			{results.length === 0 ? (
				<p>No results</p>
			) : (
				<>
					<p>Results:</p>
					{results.map(r => {
						return (
							<div key={r.id}>
								<RzLink
									label={r.title}
									href={`/recipes/${r.id}`}
									userPermissions={userPermissions}
									requiredPermission="recipes:read"
								/>
							</div>
						);
					})}
				</>
			)}
		</div>
	);
}
