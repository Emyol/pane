# Pane

> Your personal workspace — a minimal, customizable widget dashboard.

Pane is an auth-required personal workspace where you add, remove, resize, and
rearrange widgets (Todo, Timer, Notes, Habit Grid) on a responsive grid. State
persists per-user to Supabase Postgres and the app deploys on Vercel.

## Tech Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** + **shadcn/ui** (new-york) + **Lucide** icons
- **react-grid-layout** for drag/resize
- **Zustand** for client state (debounced 300ms persist)
- **Supabase** (`@supabase/ssr`) for Auth + Postgres (JSONB workspace payload)
- **next-themes** for light/dark/system
- **Vitest** + Testing Library for unit tests

## Prerequisites

- Node.js **20.x**
- A **Supabase** project (free tier is fine)
- A **Vercel** account (for deployment)

## Local Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Copy the example and fill in your Supabase project values:

   ```bash
   cp .env.local.example .env.local
   ```

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   If you installed the Supabase integration through the Vercel Marketplace,
   you can instead run `vercel env pull .env.local`.

3. **Run the database migration**

   In the Supabase dashboard → **SQL Editor**, paste and run
   [`supabase/migrations/001_workspaces.sql`](supabase/migrations/001_workspaces.sql).
   This creates the `workspaces` table, RLS policies, and a trigger that
   auto-provisions an empty workspace for each new user.

4. **Enable auth providers**

   Supabase dashboard → **Authentication → Providers**:

   - Enable **Email** (magic link)
   - Enable **Google** (add OAuth credentials from Google Cloud Console)
   - Set **Site URL** to `http://localhost:3000`
   - Add redirect URL: `http://localhost:3000/auth/callback`

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Unauthenticated visits
   redirect to `/login`; after signing in you land on `/dashboard`.

## Scripts

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `npm run dev`      | Start the dev server (Turbopack)  |
| `npm run build`    | Production build                  |
| `npm start`        | Run the production build          |
| `npm run lint`     | ESLint                            |
| `npm test`         | Vitest (watch)                    |
| `npm run test:run` | Vitest (single run)               |

## Project Structure

```
app/               # App Router routes (login, auth callback, dashboard)
components/
  auth/            # LoginForm
  dashboard/       # Shell, grid canvas, picker, theme, shortcuts, menu
  widgets/         # WidgetChrome + todo / notes / timer / habit-grid
  ui/              # shadcn/ui primitives
  providers/       # ThemeProvider
lib/
  supabase/        # browser, server, middleware clients
  storage/         # StorageAdapter + Supabase implementation
  stores/          # Zustand workspace store
  widgets/         # widget registry (type -> metadata/component)
  types/           # Workspace + widget types
  utils/           # cn, debounce, timer, habit-streak
supabase/migrations/  # SQL schema
__tests__/         # Vitest unit tests
```

## Deployment (Vercel)

1. Link the project:

   ```bash
   npx vercel link
   ```

2. Install the **Supabase** integration in the Vercel dashboard (auto-syncs
   env vars), or add the three Supabase env vars manually.

3. In Supabase, add the production redirect URL:
   `https://your-domain.vercel.app/auth/callback` and set the Site URL.

4. Deploy:

   ```bash
   npx vercel          # preview
   npx vercel --prod   # production
   ```

## Architecture Notes

- **Auth required** — middleware protects `/dashboard`; no guest/localStorage path.
- **Single source of truth** — the full workspace document is stored as JSONB in
  `workspaces.payload`; the client hydrates Zustand on mount and writes back via
  a 300ms-debounced upsert.
- **Optimistic UI** — edits apply immediately; failed saves surface a toast.
- **Widget registry** — each widget type maps to metadata + a lazily-loaded
  component, so adding a new widget is a single registry entry.

## License

Private project for the iCARE AI Launch.
