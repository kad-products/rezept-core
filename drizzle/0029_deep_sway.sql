CREATE TABLE `verifications` (
	`id` text PRIMARY KEY NOT NULL,
	`ingredient_id` text,
	`ingredient_season_id` text,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`ingredient_season_id`) REFERENCES `ingredient_seasons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `verifications_ingredient_id_idx` ON `verifications` (`ingredient_id`);--> statement-breakpoint
CREATE INDEX `verifications_ingredient_season_id_idx` ON `verifications` (`ingredient_season_id`);--> statement-breakpoint
ALTER TABLE `ingredient_seasons` ADD `last_verified_at` text;--> statement-breakpoint
ALTER TABLE `ingredients` ADD `last_verified_at` text;