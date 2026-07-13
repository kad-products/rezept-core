import type { RequestInfo } from 'rwsdk/worker';
import { RzPopMenu } from '@/components/design-system';
import IngredientForm from '@/forms/ingredient';
import AdminLayout from '@/layouts/admin';
import { getIngredientById } from '@/repositories';
import type { IngredientDBRead } from '@/types/ingredients';

export default async function Pages__admin__ingredients__edit({ ctx, params }: RequestInfo): Promise<React.JSX.Element> {
	const ingredientId = params.ingredientId;
	let ingredient: IngredientDBRead = {} as IngredientDBRead;
	if (ingredientId) {
		ingredient = await getIngredientById(ingredientId, ctx.logger);
	}

	const pageTitle = ingredientId ? `Edit ${ingredient.name}` : 'New Ingredient';

	return (
		<AdminLayout ctx={ctx} currentBasePage="ingredients" pageTitle={pageTitle}>
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
						label: 'Seasons',
						href: `/admin/ingredients/${ingredientId}/seasons`,
					},
					{
						requiredPermission: 'verifications:read',
						label: 'Verify',
						href: `/admin/ingredients/${ingredient.id}/verify`,
					},
				]}
			/>
			<IngredientForm ingredient={ingredient} />
		</AdminLayout>
	);
}
