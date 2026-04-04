/**
 * Script de migration : extrait les données de MajalisApp.jsx
 * et génère data/sources/fiqh-nafs-hashimi.json
 *
 * Usage : npx tsx scripts/migrate-majalis.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { SourceFile, Source, Unit, Chunk, QuizQuestion } from "../shared/schema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

/* ─── 1. Lire les fichiers sources ───────────────────── */

const jsxContent = readFileSync(
  join(ROOT, "client/src/pages/MajalisApp.jsx"),
  "utf-8"
);

const quizDataRaw: Record<string, Array<{
  type: string;
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}>> = JSON.parse(
  readFileSync(join(ROOT, "client/src/pages/quizData.json"), "utf-8")
);

/* ─── 2. Extraire ALL_MODULES depuis le fichier JSX ─── */

// On cherche le texte entre "const ALL_MODULES = " et la ligne "const sw ="
// en utilisant un compteur de crochets
const startMarker = "const ALL_MODULES = ";
const startIdx = jsxContent.indexOf(startMarker) + startMarker.length;

let depth = 0;
let endIdx = startIdx;
let inString: false | string = false;
let escaped = false;

for (let i = startIdx; i < jsxContent.length; i++) {
  const ch = jsxContent[i];

  if (escaped) { escaped = false; continue; }
  if (ch === "\\") { escaped = true; continue; }

  if (inString) {
    if (ch === inString) inString = false;
    continue;
  }

  if (ch === '"' || ch === "'" || ch === "`") { inString = ch; continue; }
  if (ch === "[" || ch === "{" || ch === "(") depth++;
  if (ch === "]" || ch === "}" || ch === ")") {
    depth--;
    if (depth === 0) { endIdx = i + 1; break; }
  }
}

const arrayText = jsxContent.slice(startIdx, endIdx);

// eslint-disable-next-line no-new-func
const ALL_MODULES: Array<{
  module_id: string;
  youtube_url: string;
  title: string;
  objectives: string[];
  concepts: Array<{ term: string; definition: string }>;
  sections: Array<{ heading: string; content: string; subsections: unknown[] }>;
  key_points: string[];
  practical_applications: string[];
  metadata: { difficulty_level: string; word_count: number };
}> = new Function("return " + arrayText)();

console.log(`✓ ${ALL_MODULES.length} modules extraits depuis MajalisApp.jsx`);

/* ─── 3. Construire les objets Source / Unit / Chunk ─ */

const SOURCE_ID = "fiqh-nafs-hashimi";

const source: Source = {
  id: SOURCE_ID,
  slug: SOURCE_ID,
  title: "مجالس فقه النفس",
  author: "د. خالد الهاشمي",
  language: "ar",
  domain: "تزكية النفس",
  source_type: "video_series",
  description: "سلسلة مجالس علمية في فقه النفس وتزكيتها وفق منهج الوحي",
  tags: ["فقه النفس", "تزكية", "علم النفس الإسلامي", "الهاشمي"],
  created_at: new Date().toISOString(),
  meta: {
    total_units: ALL_MODULES.length,
  },
};

const units: Unit[] = [];
const chunks: Chunk[] = [];
const quizQuestions: QuizQuestion[] = [];

for (const mod of ALL_MODULES) {
  const unitId = `${SOURCE_ID}-unit-${mod.module_id}`;
  const order = parseInt(mod.module_id, 10);

  /* --- Unit --- */
  const unit: Unit = {
    id: unitId,
    source_id: SOURCE_ID,
    parent_id: null,
    level: 1,
    order,
    label: "مجلس",
    title: mod.title,
    media_url: mod.youtube_url || undefined,
    is_published: true,
    meta: {
      difficulty_level: mod.metadata?.difficulty_level ?? "intermediate",
      word_count: mod.metadata?.word_count ?? 0,
      original_module_id: mod.module_id,
    },
  };
  units.push(unit);

  let chunkOrder = 0;

  /* --- Objectifs --- */
  for (const obj of mod.objectives) {
    chunks.push({
      id: `${unitId}-obj-${chunkOrder}`,
      unit_id: unitId,
      order: chunkOrder++,
      type: "question",
      content: obj,
      meta: { subtype: "objective" },
    });
  }

  /* --- Concepts --- */
  for (const concept of mod.concepts) {
    chunks.push({
      id: `${unitId}-concept-${chunkOrder}`,
      unit_id: unitId,
      order: chunkOrder++,
      type: "definition",
      content: `${concept.term}: ${concept.definition}`,
      meta: { term: concept.term, definition: concept.definition },
    });
  }

  /* --- Sections --- */
  for (const section of mod.sections) {
    if (section.heading) {
      chunks.push({
        id: `${unitId}-heading-${chunkOrder}`,
        unit_id: unitId,
        order: chunkOrder++,
        type: "heading",
        content: section.heading,
        meta: {},
      });
    }
    if (section.content) {
      chunks.push({
        id: `${unitId}-text-${chunkOrder}`,
        unit_id: unitId,
        order: chunkOrder++,
        type: "text",
        content: section.content,
        meta: {},
      });
    }
  }

  /* --- Points clés --- */
  for (const kp of mod.key_points) {
    chunks.push({
      id: `${unitId}-summary-${chunkOrder}`,
      unit_id: unitId,
      order: chunkOrder++,
      type: "summary",
      content: kp,
      meta: {},
    });
  }

  /* --- Applications pratiques --- */
  for (const app of mod.practical_applications) {
    chunks.push({
      id: `${unitId}-app-${chunkOrder}`,
      unit_id: unitId,
      order: chunkOrder++,
      type: "text",
      content: app,
      meta: { subtype: "practical_application" },
    });
  }

  /* --- Questions de quiz dédiées --- */
  const dedicated = quizDataRaw[mod.module_id];
  if (dedicated) {
    dedicated.forEach((q, i) => {
      quizQuestions.push({
        id: `${unitId}-quiz-${i}`,
        unit_id: unitId,
        order: i,
        type: q.type,
        question: q.question,
        options: q.options,
        correct: q.correct,
        explanation: q.explanation,
      });
    });
  }
}

console.log(`✓ ${units.length} units créées`);
console.log(`✓ ${chunks.length} chunks créés`);
console.log(`✓ ${quizQuestions.length} questions de quiz dédiées`);

/* ─── 4. Écrire le fichier JSON de sortie ────────────── */

const outputDir = join(ROOT, "data/sources");
mkdirSync(outputDir, { recursive: true });

const outputPath = join(outputDir, `${SOURCE_ID}.json`);

const output: SourceFile = {
  source,
  units,
  chunks,
  quiz_questions: quizQuestions,
};

writeFileSync(outputPath, JSON.stringify(output, null, 2), "utf-8");

console.log(`\n✅ Fichier généré : ${outputPath}`);
console.log(`   Source : ${source.title}`);
console.log(`   Units  : ${units.length}`);
console.log(`   Chunks : ${chunks.length}`);
console.log(`   Quiz   : ${quizQuestions.length} questions`);
