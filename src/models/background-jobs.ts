import crypto from 'node:crypto';
import { relations } from 'drizzle-orm';
import { index, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { users } from './users';

// Job names are kebab-case and must match filenames in src/jobs/orchestrators/ and src/jobs/processors/.
// Add each name here when implementing the corresponding job.
// The DB column uses plain text; the API layer enforces that only known names are accepted.
export const backgroundJobName = [] as const satisfies readonly string[];
export type BackgroundJobName = (typeof backgroundJobName)[number];

export const backgroundJobStatus = ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'] as const;

export const backgroundJobs = sqliteTable(
	'background_jobs',
	{
		id: text()
			.primaryKey()
			.$defaultFn(() => crypto.randomUUID()),
		name: text().notNull(),
		status: text({ enum: backgroundJobStatus }).notNull().default('PENDING'),
		notes: text(),
		completedAt: text(),
		createdAt: text()
			.notNull()
			.$defaultFn(() => new Date().toISOString()),
		createdBy: text()
			.notNull()
			.references(() => users.id),
		updatedAt: text(),
		updatedBy: text().references(() => users.id),
		deletedAt: text(),
		deletedBy: text().references(() => users.id),
	},
	table => [index('background_jobs_name_idx').on(table.name), index('background_jobs_status_idx').on(table.status)],
);

export const backgroundJobsRelations = relations(backgroundJobs, ({ one }) => ({
	creator: one(users, {
		fields: [backgroundJobs.createdBy],
		references: [users.id],
		relationName: 'backgroundJobCreator',
	}),
}));
