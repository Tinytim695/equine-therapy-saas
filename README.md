# Equine Therapy SaaS

Dual-sided Equine Therapy platform built with **Next.js 16**, **Tailwind CSS v4**, and **Supabase**.

Therapists manage horses and clinical session notes. Clients view their progress and sessions. Role-based routing and Row Level Security keep the two sides cleanly separated.

## Phase 1 — Complete

- Next.js App Router + TypeScript + Tailwind CSS
- Supabase Auth (email/password) with role selection on signup
- Database schema: `profiles` (therapist | client), `horses`, `session_notes`
- Middleware that routes:
  - **Therapist** → `/dashboard/pro`
  - **Client** → `/dashboard/client`
- Basic protected dashboards and auth pages

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/Tinytim695/equine-therapy-saas.git
cd equine-therapy-saas
npm install
```

### 2. Supabase setup

1. Create a project at [supabase.com](https://supabase.com)
2. Copy your **Project URL** and **anon key**
3. Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. In the Supabase SQL Editor, run the entire contents of:

```
supabase/schema.sql
```

This creates tables, RLS policies, the profile auto-create trigger, and indexes.

### 3. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  login/          # Sign-in page
  signup/         # Sign-up with role selection
  auth/callback/  # OAuth / magic-link callback
  dashboard/
    pro/          # Therapist dashboard
    client/       # Client dashboard
  page.tsx        # Landing (auto-redirects if logged in)
lib/supabase/     # Browser, server, and middleware clients
supabase/
  schema.sql      # Full database schema + RLS
types/            # Shared TypeScript types
middleware.ts     # Auth + role-based routing
```

## Auth Flow

1. User signs up and chooses **Therapist** or **Client**
2. Profile row is created automatically via database trigger (role stored in `raw_user_meta_data`)
3. On login / after callback, middleware + client redirect based on `profiles.role`
4. Visiting the wrong dashboard forces a redirect to the correct one

## Next Phases (not built yet)

- Horse management UI
- Session note editor
- Muscle maps / body charts
- Rehab plan builder
- Client–therapist linking

## License

Private / proprietary for now.
