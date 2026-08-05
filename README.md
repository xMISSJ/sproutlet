# Sproutlet

Quiet care for the plants you live with.

Sproutlet started as a personal plant journal. It may grow into a small shared app where anyone can browse a species catalog, keep plants in their care, track watering, and see what each plant needs—light, humidity, and how often to water.

## What it does

- **Catalog** — browse species with care level, watering cadence, and other needs; add the ones you own
- **My plants** — your care collection, with last-watered tracking and due reminders
- **Plant details** — care notes for each species so you know what it wants
- **Cabinet** — a small 3D shelf for favorites

Works locally out of the box. Optional Supabase wiring is ready for auth and cloud sync when you open it up to more people.

## Run locally

```bash
npm install
npm run dev
```

Optional: copy `.env.example` to `.env` for Supabase (cloud sync / auth).

## Data model (for multi-user rollout)

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
