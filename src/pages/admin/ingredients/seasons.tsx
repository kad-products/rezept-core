import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu, RzTable } from '@/components/design-system';
import AdminLayout from '@/layouts/admin';
import { getIngredientById } from '@/repositories';
import type { RzTableColumn } from '@/types';

const columns: RzTableColumn[] = [
	{ key: 'name', label: 'Name' },
	{ key: 'description', label: 'Description' },
	{ key: 'createdAt', label: 'Created' },
	{
		key: 'actions',
		label: '',
		actions: [
			{ type: 'link', hrefProp: 'editUrl', label: 'Edit', requiredPermission: 'ingredients:update' },
			{ type: 'link', hrefProp: 'seasonsUrl', label: 'Seasons', requiredPermission: 'ingredients:update' },
		],
	},
];

export default async function Pages__admin__ingredients__seasons({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const ingredient = await getIngredientById(params.ingredientId, ctx.logger);

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
				]}
			/>
			{JSON.stringify(ingredient)}
			<RzTable userPermissions={ctx.permissions} columns={columns} data={ingredient.seasons} />
		</AdminLayout>
	);
}
