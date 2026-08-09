# Equine Therapy SaaS

Dual-sided platform for **therapists** and **clients** \u2014 muscle mapping, rehab plans, live Supabase data, and PDF session reports.

**Stack:** Next.js 16 \u00b7 TypeScript \u00b7 Tailwind CSS v4 \u00b7 Supabase Auth + Postgres \u00b7 jsPDF

## Features (Phases 1\u20135)

| Side | Capabilities |
|------|----------------|
| **Therapist** | Auth, horse roster, interactive SVG muscle map, rehab builder, save sessions to Supabase, PDF export, toasts |
| **Client** | Auth, live session history, plain-English muscle view, daily checklist with progress, PDF download |

## Quick start

```bash
git clone https://github.com/Tinytim695/equine-therapy-saas.git
cd equine-therapy-saas
npm install
```

### Environment

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Database

In the Supabase SQL Editor, run in order:

1. `supabase/schema.sql` \u2014 tables, RLS, profile trigger  
2. `supabase/phase4_migration.sql` \u2014 `muscle_map` + `rehab_plan` JSONB columns  

### Run

```bash
npm run dev
```

Open http://localhost:3000 \u2014 sign up as **Therapist** or **Client**.

### Deploy (Vercel)

1. Import the GitHub repo in Vercel  
2. Add the same env vars  
3. Deploy  

## Project layout

```
app/
  login/  signup/  auth/callback/
  dashboard/pro/     # Therapist workspace
  dashboard/client/  # Client portal
components/
  MuscleMap.tsx  RehabBuilder.tsx
  ClientMuscleView.tsx  ClientRehabChecklist.tsx
  DownloadSessionPdf.tsx
  ui/Spinner.tsx  ui/Toast.tsx
lib/
  supabase/   # browser + server + middleware clients
  data/       # horses + sessions queries
  pdf/        # sessionReport.ts (jsPDF)
supabase/
  schema.sql
  phase4_migration.sql
types/
middleware.ts
```

## Typical flow

1. Therapist signs up \u2192 adds a horse \u2192 selects a client profile  
2. Maps muscle severity + builds rehab plan \u2192 **Save session to Supabase**  
3. Client signs in \u2192 sees session, checklist, muscle summary  
4. Either side downloads a **Session PDF**

## License

Private / proprietary for now.
