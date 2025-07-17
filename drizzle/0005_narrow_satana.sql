CREATE TABLE `capabilities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`action` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `delegations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`from_user_id` integer NOT NULL,
	`to_user_id` integer NOT NULL,
	`capability_id` integer NOT NULL,
	`expires_at` integer DEFAULT (unixepoch()) NOT NULL,
	`delegation_token` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`capability_id`) REFERENCES `capabilities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `role_capabilities` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`role_id` integer NOT NULL,
	`capability_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`capability_id`) REFERENCES `capabilities`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_roles` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`role_id` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`role_id`) REFERENCES `roles`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `capabilities` (`name`, `action`, `description`)
VALUES
  ('user', 'READ', 'Read own user information'),
  ('user', 'CREATE', 'Create user'),
  ('user', 'UPDATE', 'Update user'),
  ('user', 'DELETE', 'Delete user'),
  ('user', 'EMAIL_RESET', 'Reset email status'),
  ('email', 'READ', 'Read email'),
  ('email', 'CREATE', 'Create email'),
  ('email', 'DELETE', 'Delete email'),
  ('email', 'SEND_RESET_REQUEST', 'Send email reset request'),
  ('cluster', 'READ', 'Read cluster'),
  ('cluster', 'CREATE', 'Create cluster'),
  ('cluster', 'UPDATE', 'Update cluster'),
  ('cluster', 'DELETE', 'Delete cluster'),
  ('node', 'READ', 'Read node'),
  ('node', 'UPDATE', 'Update node'),
  ('node', 'DELETE', 'Delete node'),
  ('source-index', 'READ', 'Read source index'),
  ('source-index', 'CREATE', 'Create source index'),
  ('source-index', 'UPDATE', 'Update source index'),
  ('source-index', 'DELETE', 'Delete source index'),
  ('profile', 'READ', 'Read profile'),
  ('profile', 'CREATE', 'Create profile'),
  ('profile', 'UPDATE', 'Update profile'),
  ('profile', 'DELETE', 'Delete profile'),
  ('key', 'READ', 'Read public key'),
  ('key', 'CREATE', 'Create public key'),
  ('key', 'DELETE', 'Delete public key'),
  ('login-token', 'READ', 'Read login token'),
  ('login-token', 'CREATE', 'Generate login token'),
  ('login-token', 'DELETE', 'Delete login token');
--> statement-breakpoint
INSERT INTO `roles` (`name`, `description`)
VALUES
  ('root', 'Super admin user');
--> statement-breakpoint
INSERT INTO `role_capabilities` (`role_id`, `capability_id`)
SELECT 
  (SELECT id FROM roles WHERE name = 'root'),
  id
FROM capabilities;
--> statement-breakpoint
INSERT INTO `user_roles` (`user_id`, `role_id`)
VALUES
  ((SELECT id FROM users WHERE normalized_name = 'root'), (SELECT id FROM roles WHERE name = 'root'));
