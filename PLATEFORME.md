# Elearning-Fiqh-Nafs — Document de référence

> Dernière mise à jour : 2026-04-23

---

## 1. Vision

Plateforme d'apprentissage islamique générique, capable d'absorber n'importe quel contenu structuré (livre, série vidéo, cours audio, articles). La première source intégrée est **مجالس فقه النفس** du Dr. Al-Hashimi (164 sessions vidéo, domaine : تزكية النفس).

L'objectif à terme : une plateforme où l'on peut déposer un livre ou une transcription, définir sa structure, et obtenir immédiatement un espace d'apprentissage interactif avec suivi de progression, quiz, notes et recherche sémantique.

---

## 2. Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19 + Vite 7 |
| Langage | TypeScript 5.6 |
| Styles | Tailwind CSS 4 + inline styles (composant LearningApp) |
| UI components | shadcn/ui (Radix UI) |
| Validation schéma | Zod 4 |
| Routing client | wouter |
| Backend | Express (Node.js) |
| Déploiement | Vercel |
| Package manager | pnpm |
| Monorepo | `client/` `server/` `shared/` `patches/` |

**Repo GitHub :** `https://github.com/SaadounSaad/Elearning-Fiqh-Nafs`

---

## 3. Architecture

### Structure des fichiers clés

```
client/
  src/
    pages/
      LearningApp.tsx      — composant principal (1100+ lignes)
      FiqhNafsApp.tsx      — wrapper: charge le JSON → passe à LearningApp
      Home.tsx             — point d'entrée React
    App.tsx
  public/
    data/
      fiqh-nafs-hashimi.json   — source migrée (5.6 MB)

shared/
  schema.ts               — interfaces Zod (Source, Unit, Chunk, QuizQuestion)

data/
  sources/
    fiqh-nafs-hashimi.json   — fichier source maître

scripts/
  migrate-majalis.ts      — script de migration depuis l'ancien composant

DesignSystem-Rahiq.html   — design system de référence
elearning-context-prompt.md — document de contexte architecture
```

### Flux de données

```
JSON (public/data/*.json)
  → fetch() dans FiqhNafsApp
  → SourceFile validé par Zod
  → props vers LearningApp
  → localStorage pour état utilisateur
```

---

## 4. Modèle de données

Trois niveaux hiérarchiques + questions de quiz :

### Source
Le contenant global.
```typescript
{
  id: string          // "fiqh-nafs-hashimi"
  slug: string
  title: string       // "مجالس فقه النفس"
  author: string
  language: "ar" | "fr" | "en" | "mixed"
  domain: string      // "تزكية النفس"
  source_type: "book" | "article_series" | "video_series" | "audio_series" | "course" | "mixed"
  cover_url?: string
  description?: string
  tags: string[]
  meta: Record<string, any>
}
```

### Unit
La division logique (مجلس, باب, chapitre, épisode…).
```typescript
{
  id: string
  source_id: string
  parent_id: string | null   // hiérarchie imbriquée possible
  level: number              // 1=racine, 2=sous-section…
  order: number
  label: string              // "مجلس"
  title: string
  summary?: string
  duration_minutes?: number
  media_url?: string         // lien YouTube
  media_start?: number       // seconde de début
  is_published: boolean
  meta: Record<string, any>  // difficulty_level, original_module_id…
}
```

### Chunk
La brique de contenu atomique.
```typescript
{
  id: string
  unit_id: string
  order: number
  type: "text" | "heading" | "quote" | "definition" | "example"
       | "summary" | "question" | "image" | "table"
  content: string
  meta: Record<string, any>  // term, subtype, page_number…
}
```

### QuizQuestion
```typescript
{
  id: string
  unit_id: string
  type: string          // "definition" | "comprehension" | "key_point" | "application"
  question: string
  options: string[]
  correct: number       // index
  explanation?: string
}
```

---

## 5. Design System — Rahiq

Palette chaude inspirée du papier ancien. Fichier de référence : `DesignSystem-Rahiq.html`.

### Couleurs

| Token | Valeur | Usage |
|-------|--------|-------|
| `--paper` | `#F6F3EE` | Fond global |
| `--surface` | `#FBFAF7` | Cartes, navbar |
| `--ink` | `#2B2A28` | Texte principal |
| `--ink-2` | `#6B6760` | Texte secondaire |
| `--red` | `#C8341B` | Accent principal (rouge terre) |
| `--navy` | `#24386B` | Accent secondaire |
| `--blue` | `#3E7FB5` | Accent tertiaire |
| `--ok` | `#5A7D4E` | Succès / complété |
| `--amber` | `#A06B1F` | Avertissement, citations |
| `--line` | `#E6E1D7` | Bordures |

Mode sombre défini (variables CSS inversées).

### Typographie

| Usage | Police |
|-------|--------|
| Texte arabe | Noto Naskh Arabic + Amiri |
| Titres | Source Serif 4 |
| UI / labels | Geist |
| Codes / badges | Geist Mono |

### Composants récurrents
- **Badges** : `borderRadius: 999`, petite taille, couleur sémantique
- **Cards** : `borderRadius: 18px`, ombre légère, fond `--surface`
- **Boutons** : `borderRadius: 10px`, inline-flex, gap 8px
- **Direction** : RTL par défaut (`direction: rtl`)
- **Barre rouge** : liseré de 2px `#C8341B` en haut de la navbar

---

## 6. Fonctionnalités implémentées

### Navigation principale
- Barre de navigation sticky (desktop + hamburger mobile)
- 5 pages : **الرئيسية** · **الوحدات** · **الاختبارات** · **التقدم** · **ملاحظاتي**
- Badge rouge sur "ملاحظاتي" indiquant le total de notes

### Page d'accueil (Home)
- **Carte "متابعة القراءة"** : dernière unité visitée avec temps relatif et indicateur de page
- **سجل القراءة** : historique des 5 dernières unités visitées (temps relatif, progression %, clic → reprise exacte)
- **Statistiques** : unités complètes, concepts totaux, favoris, % d'avancement
- **آخر الوحدات** : 6 premières unités en grille

### Liste des unités (UnitsList)
- Grille de cartes avec progression, niveau, nombre de concepts
- Filtres : Tous / En cours / Complétés / Nouveaux / Favoris
- Filtre par niveau (مبتدئ / متوسط / متقدم)
- Pagination "عرض المزيد"

### Détail d'une unité (UnitDetail)
5 onglets de contenu + 1 onglet notes :
1. **أهداف التعلم** — objectifs d'apprentissage (chunks `question/objective`)
2. **المفاهيم** — définitions (chunks `definition`)
3. **المحتوى** — texte principal par sections (chunks `heading` + `text`)
4. **النقاط الرئيسية** — résumés (chunks `summary`)
5. **التطبيقات** — applications pratiques (chunks `text/practical_application`)
6. **ملاحظاتي** — notes personnelles de l'unité

Fonctionnalités dans l'unité :
- **Sélection de texte → note** : popup "إضافة للملاحظات" au survol de sélection
- **Note manuelle** : textarea + bouton dans l'onglet notes
- **Marquer comme favori** (étoile)
- **Cocher les sections visitées** (points verts sur les onglets)
- **Lecteur YouTube intégré** si `media_url` présent
- **Navigation Précédent / Suivant**
- **Bouton "ابدأ الاختبار"** → lance le quiz de l'unité directement
- **Restauration de scroll** : reprend exactement à la position de dernière lecture

### Quiz (Quiz)
- Sélection d'une unité → liste des questions dédiées
- 4 types : définition / compréhension / point clé / application
- Feedback immédiat avec explication
- Score final avec emojis
- Scores sauvegardés par unité

### Tableau de progression (ProgressPage)
- % global d'avancement
- Moyenne des scores quiz
- Nombre de concepts et favoris
- Barre de progression visuelle

### Notes consolidées (AllNotesPage)
- Toutes les notes groupées par unité
- Badge "مقتبس" (sélection) vs "يدوي" (manuel)
- Date de création, onglet d'origine
- Bouton "فتح الوحدة" → navigation directe
- Suppression individuelle

### Recherche globale
- Barre de recherche dans la navbar (loupe)
- Recherche dans le contenu des chunks (max 30 résultats)
- **Recherche dans les notes** (max 10 résultats, fond beige distinct)
- Surlignage du mot-clé dans les résultats
- Clic → navigation directe à l'onglet correspondant (contenu ou notes)
- Surlignage persistant dans l'unité après navigation depuis la recherche

### Historique de lecture
- `readingHistory[]` stocké en localStorage (max 10 entrées, dédupliquées)
- Mis à jour à chaque ouverture d'unité (nav + navFromSearch)
- Affiché sur la page d'accueil

---

## 7. Persistance locale

Tout l'état utilisateur est stocké en `localStorage`, clé préfixée par `learning:{source.id}:*` :

| Clé | Contenu |
|-----|---------|
| `lastPage` | Dernière page visitée |
| `lastUnitId` | Dernière unité ouverte |
| `lastTab` | Dernier onglet par unité |
| `progress` | Sections cochées par unité |
| `favorites` | IDs des unités favorites |
| `quizScores` | Scores quiz par unité |
| `notes` | Notes par unité |
| `scrollPos` | Position de scroll par unité |
| `history` | Historique de lecture (10 entrées) |

---

## 8. Roadmap

### Phase 2 — Ingestion de contenu
- Interface pour uploader un livre/transcription
- Définir la structure Source/Unit/Chunk manuellement ou via parsing
- Support multi-sources dans la même app (sélecteur de source)

### Phase 3 — Intelligence
- Embeddings sur les chunks → recherche sémantique (remplace la recherche textuelle)
- Génération automatique de fiches de révision
- Génération automatique de questions quiz via LLM

### Phase 4 — Utilisateurs
- Authentification
- Synchronisation de la progression côté serveur
- Tableau de bord multi-sources par utilisateur
