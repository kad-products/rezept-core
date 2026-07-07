PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipe_scrapes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`body_size` integer NOT NULL,
	`status` text DEFAULT 'SCRAPED' NOT NULL,
	`recipe_id` text,
	`status_text` text,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`recipe_id`) REFERENCES `recipes`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_recipe_scrapes`("id", "user_id", "body_size", "status", "recipe_id", "status_text", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by") SELECT "id", "user_id", "body_size", "status", "recipe_id", "status_text", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by" FROM `recipe_scrapes`;--> statement-breakpoint
DROP TABLE `recipe_scrapes`;--> statement-breakpoint
ALTER TABLE `__new_recipe_scrapes` RENAME TO `recipe_scrapes`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `recipe_scrapes_user_id_idx` ON `recipe_scrapes` (`user_id`);--> statement-breakpoint

-- BEGIN manually added to allow the following unique index to succeed
DELETE
FROM recipes 
WHERE source in (SELECT source FROM `recipes` WHERE source is not null GROUP BY source HAVING COUNT(1) > 1)
  AND ( source, id ) NOT IN (SELECT source, max(id) FROM `recipes` WHERE source is not null GROUP BY source HAVING COUNT(1) > 1);--> statement-breakpoint
-- END

CREATE UNIQUE INDEX `recipes_source_unique` ON `recipes` (`source`) WHERE "source" IS NOT NULL;