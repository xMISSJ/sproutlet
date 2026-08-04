# Sproutlet

A personal plant journal with a catalog you control. Add plants with your own photos, names, and care notes, then track watering in My plants.

## Features (v0)

- **Catalog** — create plants with your own image, name, description, and care details (stored locally). Starter seed plants included.
- **My plants** — personal care collection with favorites for the 3D cabinet
- **Care basics** — mark watered and follow each plant’s watering cadence

## Run locally

```bash
npm install
npm run dev
```

Optional: copy `.env.example` to `.env` for Supabase when you want cloud sync/auth.

## Data model (for later rollout)

| Table | Purpose |
| --- | --- |
| `plants` | Shared species catalog |
| `care_plants` | Per-user plants in care (links to catalog) |
| `user_roles` | Admin/member roles when you open it up |

SQL lives in `supabase/schema.sql`.

## Stack

Vite, Vue 3, Vue Router, Nuxt UI, Tailwind CSS 4, Three.js, Supabase (optional).

## Deploy to GitHub Pages

Pushing to `main` runs [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml) and publishes the Vite build.

**One-time repo setup**

1. GitHub → **Settings** → **Pages**
2. Under **Build and deployment**, set **Source** to **GitHub Actions**

Site URL: `https://xmissj.github.io/sproutlet/`

Optional: still works locally with:

```bash
npm run deploy
```

For production builds that talk to Supabase, add repository secrets:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_AUTH_REDIRECT_URL` (e.g. `https://xmissj.github.io/sproutlet/`)
