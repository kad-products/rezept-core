ALTER TABLE `recipe_imports` RENAME TO `recipe_uploads`;--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_recipe_uploads` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`original_filename` text NOT NULL,
	`r2_key` text NOT NULL,
	`mime_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`status` text DEFAULT 'UPLOADED' NOT NULL,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_recipe_uploads`("id", "user_id", "original_filename", "r2_key", "mime_type", "file_size", "status", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by") SELECT "id", "user_id", "original_filename", "r2_key", "mime_type", "file_size", "status", "created_at", "created_by", "updated_at", "updated_by", "deleted_at", "deleted_by" FROM `recipe_uploads`;--> statement-breakpoint
DROP TABLE `recipe_uploads`;--> statement-breakpoint
ALTER TABLE `__new_recipe_uploads` RENAME TO `recipe_uploads`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE INDEX `recipe_uploads_user_id_idx` ON `recipe_uploads` (`user_id`);