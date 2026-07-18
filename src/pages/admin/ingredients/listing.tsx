import type { RequestInfo } from 'rwsdk/worker';
import DownloadCSVButton from '@/components/DownloadCSVButton';
import { RzPopMenu, RzTable } from '@/components/design-system';
import AdminLayout from '@/layouts/admin';
import { getIngredients } from '@/repositories';
import type { RzTableColumn } from '@/types';

const columns: RzTableColumn[] = [
	{ key: 'name', label: 'Name' },
	{ key: 'description', label: 'Description' },
	{ key: 'hasSeasons', label: 'Has Seasons' },
	{ key: 'lastVerifiedAt', label: 'Last Verified' },
	{ key: 'createdAt', label: 'Created' },
	{
		key: 'actions',
		label: '',
		actions: [
			{ type: 'link', hrefProp: 'editUrl', label: 'Edit', requiredPermission: 'ingredients:update' },
			{ type: 'link', hrefProp: 'seasonsUrl', label: 'Seasons', requiredPermission: 'ingredients:update' },
			{ type: 'link', hrefProp: 'verifyUrl', label: 'Verify', requiredPermission: 'verifications:read' },
		],
	},
];

export default async function Pages__admin__ingredients__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const ingredients = await getIngredients({}, ctx.logger);
	const rows = ingredients.map(u => ({
		...u,
		editUrl: `/admin/ingredients/${u.id}/edit`,
		seasonsUrl: `/admin/ingredients/${u.id}/seasons`,
		verifyUrl: `/admin/ingredients/${u.id}/verify`,
	}));

	return (
		<AdminLayout ctx={ctx} currentBasePage="ingredients" pageTitle="Ingredients">
			<RzPopMenu
				userPermissions={ctx.permissions}
				items={[
					{
						requiredPermission: 'ingredients:create',
						label: 'New Ingredient',
						href: `/admin/ingredients/new`,
					},
					{
						requiredPermission: 'ingredients:load',
						label: 'Load Ingredients',
						href: `/admin/ingredients/load`,
					},
				]}
			/>
			<DownloadCSVButton data={ingredients.map(i => i.name)} />
			<RzTable userPermissions={ctx.permissions} columns={columns} data={rows} />
		</AdminLayout>
	);
}
