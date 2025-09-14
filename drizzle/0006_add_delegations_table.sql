-- Create the delegations table
CREATE TABLE `delegations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from` text NOT NULL,
	`token` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);