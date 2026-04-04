import { z } from "zod";

/* ═══════════════════════════════════════════════════════
   SOURCE — le contenant (série, livre, cours…)
   ═══════════════════════════════════════════════════════ */

export const SourceTypeSchema = z.enum([
  "book",
  "article_series",
  "video_series",
  "audio_series",
  "course",
  "mixed",
]);
export type SourceType = z.infer<typeof SourceTypeSchema>;

export const SourceSchema = z.object({
  id: z.string(),
  slug: z.string(),
  title: z.string(),
  author: z.string(),
  language: z.enum(["ar", "fr", "en", "mixed"]),
  domain: z.string(),
  source_type: SourceTypeSchema,
  cover_url: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()),
  created_at: z.string(),
  meta: z.record(z.string(), z.unknown()),
});
export type Source = z.infer<typeof SourceSchema>;

/* ═══════════════════════════════════════════════════════
   UNIT — la division logique (مجلس, chapitre, épisode…)
   ═══════════════════════════════════════════════════════ */

export const UnitSchema = z.object({
  id: z.string(),
  source_id: z.string(),
  parent_id: z.string().nullable(),
  level: z.number().int().min(1),
  order: z.number().int().min(1),
  label: z.string(),
  title: z.string(),
  summary: z.string().optional(),
  duration_minutes: z.number().optional(),
  media_url: z.string().optional(),
  media_start: z.number().optional(),
  is_published: z.boolean(),
  meta: z.record(z.string(), z.unknown()),
});
export type Unit = z.infer<typeof UnitSchema>;

/* ═══════════════════════════════════════════════════════
   CHUNK — la brique de contenu
   ═══════════════════════════════════════════════════════ */

export const ChunkTypeSchema = z.enum([
  "text",
  "heading",
  "quote",
  "definition",
  "example",
  "summary",
  "question",
  "image",
  "table",
]);
export type ChunkType = z.infer<typeof ChunkTypeSchema>;

export const ChunkSchema = z.object({
  id: z.string(),
  unit_id: z.string(),
  order: z.number().int().min(0),
  type: ChunkTypeSchema,
  content: z.string(),
  meta: z.record(z.string(), z.unknown()),
});
export type Chunk = z.infer<typeof ChunkSchema>;

/* ═══════════════════════════════════════════════════════
   QUIZ QUESTION — question d'évaluation liée à une Unit
   ═══════════════════════════════════════════════════════ */

export const QuizQuestionSchema = z.object({
  id: z.string(),
  unit_id: z.string(),
  order: z.number().int().min(0),
  type: z.string(),
  question: z.string(),
  options: z.array(z.string()),
  correct: z.number().int().min(0),
  explanation: z.string().optional(),
});
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

/* ═══════════════════════════════════════════════════════
   USER PROGRESS — suivi par utilisateur
   ═══════════════════════════════════════════════════════ */

export const UserProgressSchema = z.object({
  user_id: z.string(),
  unit_id: z.string(),
  status: z.enum(["not_started", "in_progress", "completed"]),
  last_position: z.number().optional(),
  completed_at: z.string().optional(),
  notes: z.string().optional(),
});
export type UserProgress = z.infer<typeof UserProgressSchema>;

/* ═══════════════════════════════════════════════════════
   SOURCE FILE — structure complète d'un fichier JSON
   ═══════════════════════════════════════════════════════ */

export const SourceFileSchema = z.object({
  source: SourceSchema,
  units: z.array(UnitSchema),
  chunks: z.array(ChunkSchema),
  quiz_questions: z.array(QuizQuestionSchema),
});
export type SourceFile = z.infer<typeof SourceFileSchema>;
