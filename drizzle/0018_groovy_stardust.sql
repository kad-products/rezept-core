ALTER TABLE `credentials` ADD `created_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `credentials` ADD `updated_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `credentials` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `credentials` ADD `deleted_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `users` ADD `created_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `users` ADD `updated_by` text REFERENCES users(id);--> statement-breakpoint
ALTER TABLE `users` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `users` ADD `deleted_by` text REFERENCES users(id);