# Vectra Marketplace

The component registry for Vectra Studio. A production-ready Next.js 14 site that serves as the single source of truth for all components available in the Studio canvas.

## Architecture

```
Marketplace (this repo)         Studio (vectra-studio repo)
────────────────────────        ───────────────────────────
/api/components?studio=1  ───►  UIContext.componentRegistry
/api/components/:slug     ───►  Drop-on-canvas source fetch
/api/publish              ◄───  AI codegen → publish-back
```

## Stack

- **Next.js 14** App Router
- **Supabase** Postgres + Storage
- **Tailwind CSS** dark theme
- **TypeScript** strict mode

---

## Setup

### 1. Create Supabase project

Go to [supabase.com](https://supabase.com) → New project.

### 2. Run the migration

In Supabase Dashboard → SQL Editor → New Query, paste and run:

```
supabase/migrations/001_initial.sql
```

### 3. Configure environment

```bash
cp .env.local.example .env.local
```

Fill in your Supabase URL, anon key, service role key, and a random publish secret.

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
VECTRA_PUBLISH_SECRET=your_random_secret
```

### 4. Install dependencies

```bash
npm install
```

### 5. Seed the database

```bash
npm run seed
```

This populates Supabase with all official Vectra components (migrated from Studio's `constants.ts`).

### 6. Run dev server

```bash
npm run dev
# → http://localhost:3001
```

---

## Connect to Studio

Add to Studio's `.env.local`:

```env
VITE_MARKETPLACE_URL=http://localhost:3001
```

Then apply the 2-line change described in `src/STUDIO_INTEGRATION.ts`:

1. Copy `src/hooks/useMarketplaceSync.ts` into the Studio repo
2. Import and call it in `UIContext.tsx` — 2 lines total

---

## API Reference

### `GET /api/components`

List and search components.

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Full-text search |
| `category` | ComponentCategory | Filter by category |
| `sort` | popular \| newest \| stars \| official | Sort order |
| `page` | number | Page (default 1) |
| `limit` | number | Per page (default 24) |
| `official` | `1` | Official only |
| `studio` | `1` | Studio-optimized shape (no sourceCode) |

### `GET /api/components/:slug`

Get a single component by slug or UUID. Returns full `ComponentRegistryEntry` including `sourceCode`.

### `POST /api/publish`

Publish a new component. Requires `x-vectra-publish-secret` header.

```json
{
  "name": "vectra:HeroSection",
  "version": "1.0.0",
  "slug": "hero-section",
  "label": "Hero Section",
  "description": "A full-width hero section with CTA.",
  "category": "sections",
  "tags": ["hero", "landing"],
  "importMeta": {
    "packageName": "@vectra/ui",
    "exportName": "HeroSection",
    "isDefaultExport": false
  },
  "sourceCode": "export function HeroSection() { ... }",
  "defaultProps": {},
  "propsSchema": [],
  "publishedBy": "vectra"
}
```

---

## File Structure

```
vectra-marketplace/
├── supabase/
│   └── migrations/
│       └── 001_initial.sql       ← Run this first in Supabase
├── src/
│   ├── app/
│   │   ├── layout.tsx            ← Root layout, fonts
│   │   ├── globals.css
│   │   ├── page.tsx              ← Browse catalog (home)
│   │   ├── components/
│   │   │   └── [slug]/
│   │   │       └── page.tsx      ← Component detail page
│   │   ├── publish/
│   │   │   └── page.tsx          ← Publish form
│   │   └── api/
│   │       ├── components/
│   │       │   ├── route.ts      ← GET /api/components
│   │       │   └── [id]/
│   │       │       └── route.ts  ← GET /api/components/:id
│   │       └── publish/
│   │           └── route.ts      ← POST /api/publish
│   ├── components/
│   │   ├── ComponentCard.tsx     ← Grid card
│   │   ├── ComponentGrid.tsx     ← Search + filter + grid
│   │   ├── PropsTable.tsx        ← Props documentation
│   │   └── ui/
│   │       └── CopyButton.tsx    ← Copy-to-clipboard
│   ├── lib/
│   │   ├── supabase.ts           ← Browser + server clients
│   │   ├── database.types.ts     ← DB schema types
│   │   └── registry.ts           ← All DB query functions
│   ├── data/
│   │   └── seed-data.ts          ← Official component definitions
│   ├── scripts/
│   │   └── seed.ts               ← npm run seed
│   ├── types/
│   │   └── index.ts              ← Re-export of @vectra/types
│   └── STUDIO_INTEGRATION.ts     ← Instructions + hook for Studio
├── .env.local.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Deploy to Vercel

```bash
vercel deploy
```

Set the same env vars in Vercel project settings. The Marketplace URL becomes `https://marketplace.vectra.app` — update `VITE_MARKETPLACE_URL` in Studio accordingly.
