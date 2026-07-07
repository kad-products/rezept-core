import { and, eq, isNull, sql } from 'drizzle-orm';
import db from '@/db';
import { recipeCookingMethods } from '@/models';
import type { RecipeCookingMethodDBRead, RecipeCookingMethodWriteInput, RzLogger } from '@/types';

export async function updateRecipeCookingMethods(
	sectionId: string,
	cookingMethodsData: RecipeCookingMethodWriteInput[],
	userId: string,
	logger: RzLogger,
): Promise<RecipeCookingMethodDBRead[]> {
	logger.debug(`Updating cooking methods for section ${sectionId}`);

	// get existing cooking methods for the section (must happen before mutations)
	const existingMethods = await db
		.select()
		.from(recipeCookingMethods)
		.where(and(eq(recipeCookingMethods.recipeSectionId, sectionId), isNull(recipeCookingMethods.deletedAt)));

	logger.debug(`Found ${existingMethods.length} existing cooking methods for section ${sectionId}`);

	// soft-delete removed cooking methods
	const removedMethodIds = existingMethods.map(m => m.id).filter(id => !cookingMethodsData.some(md => md.id === id));

	await Promise.all(
		removedMethodIds.map(id =>
			db
				.update(recipeCookingMethods)
				.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: userId })
				.where(eq(recipeCookingMethods.id, id)),
		),
	);

	if (removedMethodIds.length > 0) {
		logger.info(`Deleted ${removedMethodIds.length} cooking methods for section ${sectionId}`);
	}

	const returnMethods: RecipeCookingMethodDBRead[] = [];

	for (const methodData of cookingMethodsData) {
		if (methodData.id) {
			const [updatedMethod] = await db
				.update(recipeCookingMethods)
				.set({
					name: methodData.name,
					order: methodData.order,
					updatedAt: sql`(datetime('now', 'localtime'))`,
					updatedBy: userId,
				})
				.where(eq(recipeCookingMethods.id, methodData.id))
				.returning();

			logger.info(`Updated cooking method ${methodData.id}`);
			returnMethods.push(updatedMethod);
		} else {
			const [newMethod] = await db
				.insert(recipeCookingMethods)
				.values({
					recipeSectionId: sectionId,
					name: methodData.name,
					order: methodData.order,
					createdBy: userId,
				})
				.returning();

			logger.info(`Created cooking method ${newMethod.id} for section ${sectionId}`);
			returnMethods.push(newMethod);
		}
	}

	logger.info(`Updated ${returnMethods.length} cooking methods for section ${sectionId}`);
	return returnMethods;
}
