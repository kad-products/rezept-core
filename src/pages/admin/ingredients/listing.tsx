import type { RequestInfo } from 'rwsdk/worker';
import { RzLink, RzTable } from '@/components/design-system';
import AdminLayout from '@/layouts/admin';
import { getIngredients } from '@/repositories';
import type { RzTableColumn } from '@/types';

const columns: RzTableColumn[] = [
	{ key: 'name', label: 'Name' },
	{ key: 'description', label: 'Description' },
	{ key: 'createdAt', label: 'Created' },
	{
		key: 'actions',
		label: '',
		actions: [{ type: 'link', hrefProp: 'editUrl', label: 'Edit', requiredPermission: 'users:update' }],
	},
];

export default async function Pages__admin__ingredients__listing({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	const ingredients = await getIngredients(ctx.logger);
	const rows = ingredients.map(u => ({ ...u, editUrl: `/admin/ingredients/${u.id}/edit` }));

	return (
		<AdminLayout ctx={ctx} currentBasePage="ingredients" pageTitle="Ingredients">
			<RzLink
				userPermissions={ctx.permissions}
				requiredPermission="ingredients:create"
				label="New Ingredient"
				href="/admin/ingredients/new"
			/>
			<RzTable userPermissions={ctx.permissions} columns={columns} data={rows} />
		</AdminLayout>
	);
}
