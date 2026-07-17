'use client';
import { useState } from 'react';

import InSeasonRecipeSearchForm from '@/forms/in-season-recipe-search';
import type { RecipeDBRead } from '@/types';

export default function RecipeSearch({
	growingZoneOptions,
}: {
	growingZoneOptions: { value: string; label: string }[];
}): React.ReactNode {
	const [results, setResults] = useState<RecipeDBRead[]>([]);

	return (
		<div>
			<InSeasonRecipeSearchForm growingZoneOptions={growingZoneOptions} setResults={setResults} />
			{results.length === 0 ? (
				<p>No results</p>
			) : (
				<>
					<p>Results:</p>
					{results.map(r => {
						return <div key={r.id}>{JSON.stringify(r)}</div>;
					})}
				</>
			)}
		</div>
	);
}
