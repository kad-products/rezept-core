CREATE TABLE `seasonal_ingredients` (
	`id` text PRIMARY KEY NOT NULL,
	`ingredient_id` text NOT NULL,
	`season_id` text NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`ingredient_id`) REFERENCES `ingredients`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`season_id`) REFERENCES `seasons`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `seasonal_ingredients_ingredient_id_idx` ON `seasonal_ingredients` (`ingredient_id`);--> statement-breakpoint
CREATE INDEX `seasonal_ingredients_season_id_idx` ON `seasonal_ingredients` (`season_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `seasonal_ingredients_ingredient_season_unique` ON `seasonal_ingredients` (`ingredient_id`,`season_id`);--> statement-breakpoint
CREATE TABLE `seasons` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`country` text NOT NULL,
	`region` text,
	`start_month` integer NOT NULL,
	`end_month` integer NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	`updated_at` text,
	`updated_by` text,
	`deleted_at` text,
	`deleted_by` text,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`deleted_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `seasons_country_idx` ON `seasons` (`country`);--> statement-breakpoint
CREATE INDEX `seasons_region_idx` ON `seasons` (`region`);--> statement-breakpoint
CREATE INDEX `seasons_country_region_idx` ON `seasons` (`country`,`region`);