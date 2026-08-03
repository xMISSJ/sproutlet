# Sproutlet

A personal plant journal with a shared species catalog. Browse plants, add the ones in your care, and track simple watering — ready to grow into a multi-user app later.

## Features (v0)

- **Catalog** — shared species library (seed data locally; Supabase when configured)
- **My plants** — your personal care collection (localStorage for now)
- **Care basics** — mark watered, see rough watering cadence from the catalog

## Run locally

```bash
npm install
npm run dev
```

Optional: copy `.env.example` to `.env` and fill in Supabase values when you are ready for cloud sync/auth.

## Data model (for later rollout)

| Table | Purpose |
| --- | --- |
| `plants` | Shared species catalog |
| `care_plants` | Per-user plants in care (links to catalog) |
| `user_roles` | Admin/member roles when you open it up |

SQL lives in `supabase/schema.sql`.

## Stack

Vite, Vue 3, Vue Router, Nuxt UI, Tailwind CSS 4, Supabase (optional until you wire auth/sync).

## Deploy to GitHub Pages

```bash
npm run deploy
```

For production builds that talk to Supabase, add repository secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AUTH_REDIRECT_URL`
