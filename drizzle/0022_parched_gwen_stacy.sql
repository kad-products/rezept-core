CREATE TABLE `recipe_scrape_attempts` (
	`id` text PRIMARY KEY NOT NULL,
	`recipe_scrape_id` text NOT NULL,
	`source` text DEFAULT 'api' NOT NULL,
	`workflow_instance_id` text,
	`status` text NOT NULL,
	`status_text` text,
	`app_version` text,
	`created_at` text NOT NULL,
	`created_by` text NOT NULL,
	FOREIGN KEY (`recipe_scrape_id`) REFERENCES `recipe_scrapes`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `recipe_scrape_attempts_scrape_id_idx` ON `recipe_scrape_attempts` (`recipe_scrape_id`);--> statement-breakpoint
CREATE INDEX `recipe_scrape_attempts_status_idx` ON `recipe_scrape_attempts` (`status`);