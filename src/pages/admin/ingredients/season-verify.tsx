import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu, RzTable } from '@/components/design-system';
import VerificationForm from '@/forms/verification';
import AdminLayout from '@/layouts/admin';
import { getIngredientById } from '@/repositories';
import type { RzTableColumn } from '@/types';

const columns: RzTableColumn[] = [
	{ key: 'createdAt', label: 'Verified At' },
	{ key: 'createdBy', label: 'Verified By' },
];

export default async function Pages__admin__ingredients__season_verify({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const ingredient = await getIngredientById(params.ingredientId, ctx.logger);
	const season = ingredient.seasons.find(s => s.id === params.ingredientSeasonId);

	if (!season) {
		return <p>No season</p>;
	}

	return (
		<AdminLayout
			ctx={ctx}
			currentBasePage="ingredients"
			pageTitle={`Verifications for ${ingredient.name} in ${season.growingZoneId} (${season.startMonth} to ${season.endMonth})`}
		>
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
						requiredPermission: 'ingredients:update',
						label: 'Seasons',
						href: `/admin/ingredients/${ingredient.id}/seasons`,
					},
				]}
			/>
			<RzTable userPermissions={ctx.permissions} columns={columns} data={season.verifications} />
			<VerificationForm verification={{ ingredientId: ingredient.id, ingredientSeasonId: season.id }} />
		</AdminLayout>
	);
}
