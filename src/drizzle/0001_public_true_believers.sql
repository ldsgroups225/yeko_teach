ALTER TABLE `notes` ADD `last_sync_at` text;--> statement-breakpoint
ALTER TABLE `notes` ADD `is_published` integer DEFAULT 0 NOT NULL;