CREATE TABLE `note_details` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`note_id` integer NOT NULL,
	`student_id` text NOT NULL,
	`note` integer NOT NULL,
	`graded_at` text
);
--> statement-breakpoint
CREATE TABLE `notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`school_id` text NOT NULL,
	`subject_id` text NOT NULL,
	`school_year_id` integer NOT NULL,
	`semester_id` integer NOT NULL,
	`teacher_id` text NOT NULL,
	`class_id` text NOT NULL,
	`note_type` text NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`total_points` integer DEFAULT 20 NOT NULL,
	`weight` integer DEFAULT 1 NOT NULL,
	`is_graded` integer DEFAULT 1 NOT NULL,
	`due_date` text,
	`created_at` text
);
