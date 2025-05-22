ALTER TABLE `nodes` ADD `cluster_uuid` text NOT NULL;--> statement-breakpoint
ALTER TABLE `nodes` DROP COLUMN `cluster_id`;--> statement-breakpoint
ALTER TABLE `nodes` DROP COLUMN `post_id`;