import { eq, sql } from 'drizzle-orm';
import db from '@/db';
import type RzLogger from '@/logger';
import { recipeSections } from '@/models';
import type { RecipeSectionDBRead, RecipeSectionWriteInput } from '@/types';

export async function getSectionsByRecipeId(recipeId: string, logger: RzLogger): Promise<RecipeSectionDBRead[]> {
	logger.debug(`Fetching sections for recipe ${recipeId}`);
	const sections = await db.select().from(recipeSections).where(eq(recipeSections.recipeId, recipeId));
	logger.debug(`Fetched ${sections.length} sections for recipe ${recipeId}`);
	return sections.sort((a, b) => a.order - b.order);
}

export async function updateRecipeSections(
	recipeId: string,
	sectionsData: RecipeSectionWriteInput[],
	userId: string,
	logger: RzLogger,
): Promise<RecipeSectionDBRead[]> {
	logger.debug(`Updating sections for recipe ${recipeId}`);

	// get existing sections
	const existingSections = await getSectionsByRecipeId(recipeId, logger);

	// remove ones that are not present in sectionsData
	const removedSectionIds = existingSections.map(s => s.id).filter(id => !sectionsData.some(sd => sd.id === id));

	await Promise.all(
		removedSectionIds.map(id =>
			db
				.update(recipeSections)
				.set({ deletedAt: sql`(datetime('now', 'localtime'))`, deletedBy: userId })
				.where(eq(recipeSections.id, id)),
		),
	);

	if (removedSectionIds.length > 0) {
		logger.info(`Deleted ${removedSectionIds.length} sections for recipe ${recipeId}`);
	}

	const returnSections = [];

	// update or insert sections from sectionsData
	for (const section of sectionsData) {
		if (section.id) {
			// update existing section
			const [updatedSection] = await db
				.update(recipeSections)
				.set({
					title: section.title,
					order: section.order,
					updatedAt: sql`(datetime('now', 'localtime'))`,
					updatedBy: userId,
				})
				.where(eq(recipeSections.id, section.id))
				.returning();

			logger.info(`Updated section ${section.id}`);
			returnSections.push(updatedSection);
		} else {
			// insert new section
			const [newSection] = await db
				.insert(recipeSections)
				.values({
					recipeId,
					title: section.title,
					order: section.order,
					createdBy: userId,
				})
				.returning();

			logger.info(`Created section ${newSection.id} for recipe ${recipeId}`);
			returnSections.push(newSection);
		}
	}

	logger.info(`Updated ${returnSections.length} sections for recipe ${recipeId}`);

	return returnSections;
}
