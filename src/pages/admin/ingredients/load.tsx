import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu } from '@/components/design-system';
import IngredientLoadForm from '@/forms/ingredient-load';
import AdminLayout from '@/layouts/admin';

export default async function Pages__admin__ingredients__load({ ctx }: RequestInfo): Promise<React.JSX.Element> {
	return (
		<AdminLayout ctx={ctx} currentBasePage="ingredients" pageTitle="Load Ingredients">
			<RzPopMenu
				userPermissions={ctx.permissions}
				items={[
					{
						requiredPermission: 'ingredients:create',
						label: 'New Ingredient',
						href: `/admin/ingredients/new`,
					},
					{
						requiredPermission: 'ingredients:read',
						label: 'Listing',
						href: `/admin/ingredients`,
					},
				]}
			/>
			<p>Load some ingredients y'all</p>
			<IngredientLoadForm />
		</AdminLayout>
	);
}
