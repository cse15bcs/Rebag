CREATE TABLE `design_approvals` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`draft_id` text NOT NULL,
	`version` integer NOT NULL,
	`idempotency_key` text NOT NULL,
	`payload_json` text NOT NULL,
	`design_hash` text NOT NULL,
	`fingerprint` text NOT NULL,
	`reference_key` text,
	`reference_type` text,
	`reference_hash` text,
	`fabric_key` text,
	`fabric_type` text,
	`fabric_hash` text,
	`approved_name` text NOT NULL,
	`approval_text_version` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `design_approval_owner_request` ON `design_approvals` (`owner_id`,`idempotency_key`);--> statement-breakpoint
CREATE UNIQUE INDEX `design_approval_owner_version` ON `design_approvals` (`owner_id`,`draft_id`,`version`);--> statement-breakpoint
CREATE INDEX `design_approval_owner_created` ON `design_approvals` (`owner_id`,`created_at`);