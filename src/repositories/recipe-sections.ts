import { eq } from 'drizzle-orm';
import { createInsertSchema } from 'drizzle-zod';
import z from 'zod';
import db from '@/db';
import { recipeSections } from '@/models/schema';
import type { RecipeSection, RecipeSectionFormSave } from '@/types';

export const createRecipeSectionFormValidationSchema = createInsertSchema(recipeSections, {
	id: z
		.string()
		.optional()
		.transform(val => (val === '' ? undefined : val)),
	order: z.coerce.number().min(0).default(0),
}).omit({
	createdAt: true,
	createdBy: true,
	updatedAt: true,
	updatedBy: true,
	deletedAt: true,
	deletedBy: true,
});

export async function getSectionsByRecipeId(recipeId: string): Promise<RecipeSection[]> {
	const sections = await db.select().from(recipeSections).where(eq(recipeSections.recipeId, recipeId));

	return sections.sort((a, b) => a.order - b.order);
}

export async function updateSectionsForRecipe(
	recipeId: string,
	sectionsData: RecipeSectionFormSave[],
	userId: string,
): Promise<void> {
	console.log(`Updating recipe sections for recipeId ${recipeId} with data: ${JSON.stringify(sectionsData, null, 4)} `);

	// get existing sections
	const existingSections = await getSectionsByRecipeId(recipeId);

	// remove ones that are not present in sectionsData
	const removedSectionIds = existingSections.map(s => s.id).filter(id => !sectionsData.some(sd => sd.id === id));

	await Promise.all(removedSectionIds.map(id => db.delete(recipeSections).where(eq(recipeSections.id, id))));

	console.log(`Removed section IDs: ${JSON.stringify(removedSectionIds, null, 4)} `);

	// update or insert sections from sectionsData
	for (const section of sectionsData) {
		if (section.id) {
			console.log(`Updating existing section ID ${section.id}: ${JSON.stringify(section, null, 4)} `);

			// update existing section
			await db
				.update(recipeSections)
				.set({
					title: section.title,
					order: section.order,
					updatedBy: userId,
				})
				.where(eq(recipeSections.id, section.id));

			console.log(`Updated existing section ID ${section.id}: ${JSON.stringify(section, null, 4)} `);
		} else {
			console.log(`Inserting new section for recipeId ${recipeId}: ${JSON.stringify(section, null, 4)} `);

			// insert new section
			await db.insert(recipeSections).values({
				recipeId,
				title: section.title,
				order: section.order,
				createdBy: userId,
			});

			console.log(`Inserted new section: ${JSON.stringify(section, null, 4)} `);
		}
	}

	console.log(`Updated/Inserted sections for recipeId ${recipeId}: ${JSON.stringify(sectionsData, null, 4)} `);
}
