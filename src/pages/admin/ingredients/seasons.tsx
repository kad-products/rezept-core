import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu, RzTable } from '@/components/design-system';
import { countryOptions } from '@/data/countries';
import { monthOptions } from '@/data/months';
import IngredientSeasonForm from '@/forms/ingredient-season';
import AdminLayout from '@/layouts/admin';
import { getIngredientById } from '@/repositories';
import type { RzTableColumn } from '@/types';

const columns: RzTableColumn[] = [
	{ key: 'country', label: 'Country' },
	{ key: 'region', label: 'Region' },
	{ key: 'startMonth', label: 'Start Month' },
	{ key: 'endMonth', label: 'End Month' },
	{ key: 'lastVerifiedAt', label: 'Last Verified' },
	{
		key: 'actions',
		label: '',
		actions: [{ type: 'link', hrefProp: 'verifyUrl', label: 'Verify', requiredPermission: 'verifications:read' }],
	},
];

export default async function Pages__admin__ingredients__seasons({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const ingredient = await getIngredientById(params.ingredientId, ctx.logger);
	const rows = ingredient.seasons.map(s => ({
		...s,
		verifyUrl: `/admin/ingredients/${s.ingredientId}/seasons/${s.id}/verify`,
	}));
	return (
		<AdminLayout ctx={ctx} currentBasePage="ingredients" pageTitle={`Seasons for ${ingredient.name}`}>
			<RzPopMenu
				userPermissions={ctx.permissions}
				items={[
					{
						requiredPermission: 'ingredients:read',
						label: 'Listing',
						href: `/admin/ingredients`,
					},
					{
						requiredPermission: 'ingredients:update',
						label: 'Edit',
						href: `/admin/ingredients/${ingredient.id}/edit`,
					},
					{
						requiredPermission: 'verifications:read',
						label: 'Verify',
						href: `/admin/ingredients/${ingredient.id}/verify`,
					},
				]}
			/>
			{ingredient.seasons.map(season => {
				return (
					<IngredientSeasonForm
						key={season.id}
						ingredientId={ingredient.id}
						countryOptions={countryOptions}
						monthOptions={monthOptions}
						ingredientSeason={season}
					/>
				);
			})}
			<RzTable userPermissions={ctx.permissions} columns={columns} data={rows} />
			<IngredientSeasonForm ingredientId={ingredient.id} countryOptions={countryOptions} monthOptions={monthOptions} />
		</AdminLayout>
	);
}
