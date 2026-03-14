PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`role` text DEFAULT 'BASIC',
	`created_at` text DEFAULT (datetime('now', 'localtime')) NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "username", "role", "created_at", "updated_at") SELECT "id", "username", "role", "created_at", "updated_at" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);