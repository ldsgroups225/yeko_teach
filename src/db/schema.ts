// src/db/schema.ts

import { int, sqliteTable, text } from 'drizzle-orm/sqlite-core'

export const noteTable = sqliteTable('notes', () => ({
  id: int({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  schoolId: text('school_id').notNull(),
  subjectId: text('subject_id').notNull(),
  schoolYearId: int('school_year_id').notNull(),
  semesterId: int('semester_id').notNull(),
  teacherId: text('teacher_id').notNull(),
  classId: text('class_id').notNull(),
  noteType: text('note_type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  totalPoints: int('total_points').notNull().default(20),
  weight: int('weight').notNull().default(1),
  isGraded: int('is_graded').notNull().default(1),
  dueDate: text('due_date'),
  createdAt: text('created_at').$default(() => new Date().toISOString()),
  lastSyncAt: text('last_sync_at'),
  isPublished: int('is_published').notNull().default(0),
}))

export const noteDetailTable = sqliteTable('note_details', () => ({
  id: int({ mode: 'number' }).primaryKey({ autoIncrement: true }),
  noteId: int('note_id').notNull(),
  studentId: text('student_id').notNull(),
  note: int('note').notNull(),
  gradedAt: text('graded_at'),
}))
