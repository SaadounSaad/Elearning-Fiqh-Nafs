# Contexte du projet — Refonte ELearning générique

## Ce que tu dois savoir avant de commencer

Ce projet existe déjà. Il s'appelle `Elearning-Fiqh-Nafs` et il tourne. Le problème : il est figé sur une seule matière (les Majalis Fiqh Nafs du Dr. Al-Hashimi) parce que les données sont codées en dur dans le composant principal. L'objectif de cette session est de le transformer en plateforme générique capable d'absorber n'importe quel contenu — livre, série d'articles, transcription vidéo ou audio, cours structuré.

---

## État actuel du repository

**Repo GitHub :** `https://github.com/SaadounSaad/Elearning-Fiqh-Nafs`

**Stack technique :**
- Frontend : React + Vite (JavaScript 91.9%, TypeScript 7.9%)
- Structure monorepo : `client/` `server/` `shared/` `patches/`
- UI components : shadcn/ui + Tailwind

**Le problème central :**
Le fichier `client/src/pages/MajalisApp.jsx` pèse **2.26 MB**. Tout le contenu des 164 sessions est hardcodé dedans. Ce n'est pas un composant — c'est un composant + une base de données + une logique de navigation mélangés ensemble.

Un fichier Excel séparé (`liens Youtube.xlsx`) contient les liens vidéo, ce qui veut dire que même les URLs ne sont pas intégrées proprement dans le modèle de données.

---

## Architecture cible

### Principe directeur

Tout contenu éducatif, quelle que soit sa forme, se décompose en trois niveaux :

```
Source (le contenant) → Unit (la division logique) → Chunk (la brique de texte)
```

### Niveau 1 — Source

```typescript
interface Source {
  id: string                     // uuid
  slug: string                   // ex: "fiqh-nafs-hashimi"
  title: string                  // ex: "مجالس فقه النفس"
  author: string
  language: "ar" | "fr" | "en" | "mixed"
  domain: string                 // ex: "تزكية النفس", "psychologie", "fiqh"
  source_type: SourceType
  cover_url?: string
  description?: string
  tags: string[]
  created_at: Date
  meta: Record<string, any>      // champs libres selon le type
}

type SourceType =
  | "book"
  | "article_series"
  | "video_series"
  | "audio_series"
  | "course"
  | "mixed"
```

### Niveau 2 — Unit

```typescript
interface Unit {
  id: string
  source_id: string              // FK → Source
  parent_id: string | null       // null = racine
  level: number                  // 1=باب, 2=فصل, 3=مبحث...
  order: number                  // position parmi les frères
  label: string                  // nom original : "مجلس", "باب", "حلقة", "chapitre"
  title: string
  summary?: string               // résumé manuel ou généré
  duration_minutes?: number      // pour les contenus audio/vidéo
  media_url?: string             // lien YouTube ou fichier audio
  media_start?: number           // seconde de début dans la vidéo
  is_published: boolean
  meta: Record<string, any>
}
```

### Niveau 3 — Chunk

```typescript
interface Chunk {
  id: string
  unit_id: string                // FK → Unit
  order: number
  type: ChunkType
  content: string                // le texte (ou l'URL si type = "image")
  embedding?: number[]           // pour la recherche sémantique (phase 2)
  meta: Record<string, any>      // ex: page_number, timestamp_video
}

type ChunkType =
  | "text"
  | "heading"
  | "quote"
  | "definition"
  | "example"
  | "summary"
  | "question"
  | "image"
  | "table"
```

### Couche utilisateur

```typescript
interface UserProgress {
  user_id: string
  unit_id: string
  status: "not_started" | "in_progress" | "completed"
  last_position?: number         // seconde vidéo ou index chunk
  completed_at?: Date
  notes?: string
}
```

---

## Comment les Majalis s'intègrent dans ce modèle

```
Source
  id: "fiqh-nafs-hashimi"
  source_type: "video_series"
  language: "ar"
  domain: "تزكية النفس"

  └── Unit (level=1, label="مجلس", order=1)
        title: "مجلس ١ : مقدمة في فقه النفس"
        media_url: "https://youtube.com/..."
        duration_minutes: 45

        ├── Chunk (type="text")    ← transcription complète
        ├── Chunk (type="summary") ← résumé du majlis
        └── Chunk (type="question") ← questions de réflexion
```

---

## Ce que tu dois faire dans cette session

### Étape 1 — Analyser l'existant

Lis `client/src/pages/MajalisApp.jsx` et identifie :
- La structure exacte des données hardcodées (format objet, champs présents)
- La logique de navigation entre sessions
- Les composants réutilisables vs. le code spécifique à Fiqh Nafs

### Étape 2 — Créer le schéma

Dans `shared/schema.ts`, implémente les interfaces ci-dessus.
Utilise Zod si le projet l'utilise déjà, sinon TypeScript pur.

### Étape 3 — Script de migration

Crée `scripts/migrate-majalis.ts` (ou `.js`) qui :
1. Lit les données hardcodées dans `MajalisApp.jsx`
2. Les transforme en objets conformes au schéma (`Source` + `Unit[]` + `Chunk[]`)
3. Génère un fichier `data/sources/fiqh-nafs-hashimi.json`
4. Intègre les liens YouTube depuis `liens Youtube.xlsx` si possible

### Étape 4 — Refactoring du composant

Crée `client/src/pages/LearningApp.tsx` — version générique de `MajalisApp.jsx` qui :
- Reçoit une `source_id` en prop ou en paramètre de route
- Charge les données depuis le fichier JSON (ou l'API si elle existe)
- N'a aucune référence à "Fiqh Nafs" dans le code

### Étape 5 — Vérification

Charge la source migrée dans le nouveau composant et vérifie que l'affichage est identique à l'original.

---

## Contraintes à respecter

- Ne casse pas l'application existante — travaille en parallèle, l'ancien composant reste intact jusqu'à validation
- Le nouveau composant doit fonctionner avec au moins deux sources différentes (pour prouver la généricité)
- Les noms de champs dans le JSON doivent être en anglais, le contenu reste en arabe
- Pas de dépendances nouvelles sans justification

---

## Ce qu'on construira après (pour contexte)

Une fois la refonte stable :
- Interface d'ingestion de contenu (uploader un livre ou une transcription, définir sa structure)
- Recherche sémantique sur les chunks via embeddings
- Génération automatique de fiches de révision et de questions
- Tableau de progression par source et par utilisateur

On ne s'en occupe pas maintenant. L'objectif de cette session est uniquement la séparation des données et la généricité du composant.
