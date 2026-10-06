# Kanti Science Club (KSC)

The official website and admin CMS for **Kanti Science Club**, Kanti Secondary School, Butwal, Nepal.

A student/teacher committee can run the entire public website from `/admin` — events, notices,
gallery, team, membership applications and site content — without touching code or redeploying.

- **Stack:** Next.js (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres, Auth, Storage, RLS) · Framer Motion · Zod
- **Hosting:** Vercel
- **Design:** warm-paper editorial theme, deep teal + muted amber, full light/dark mode

---

## 1. Install dependencies

```bash
npm install
```

Requires Node 20+ (Node 22+ recommended — the seed script uses native TypeScript loading).

## 2. Configure Supabase

1. Create a project at [supabase.com](https://supabase.com).
2. Copy the environment template and fill it in:

   ```bash
   cp .env.example .env.local
   ```

   | Variable | Where to find it | Exposed to browser? |
   |---|---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API | Yes |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API | Yes |
   | `NEXT_PUBLIC_SITE_URL` | Your deployment URL | Yes |
   | `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API | **No — server only** |

   Never prefix the service role key with `NEXT_PUBLIC_` and never import it into client code.

## 3. Run migrations

In the Supabase SQL editor, run the migrations in order:

1. `supabase/migrations/0001_schema.sql` — tables, enums, constraints, indexes, helper functions
2. `supabase/migrations/0002_rls.sql` — Row Level Security policies **and** storage buckets
3. `supabase/migrations/0003_event_date_validation.sql` — complete BS event-date validation
4. `supabase/migrations/0004_admin_user_read_scope.sql` — restrict editor access to admin accounts
5. `supabase/migrations/0005_api_grants.sql` — grant the least-privilege Data API permissions used by the app
6. `supabase/migrations/0006_journey_milestones.sql` — enable admin-managed historical Journey milestones
7. `supabase/migrations/0007_member_approval_and_admin_appointments.sql` — accept applications as members and link applicant accounts to appointments
8. `supabase/migrations/0008_pending_member_admin_appointments.sql` — allow accepted applicants to be appointed before account creation and activate access after contact verification

For a production project, keep **Automatically expose new tables** disabled. This migration grants the
existing app tables the required API permissions explicitly; RLS still restricts access.

Or, with the Supabase CLI:

```bash
supabase link --project-ref <your-ref>
supabase db push
```

## 4. Configure storage

`0002_rls.sql` creates five public buckets and their policies:

| Bucket | Used for |
|---|---|
| `member-photos` | Committee and advisor photos |
| `event-images` | Event cover images |
| `gallery-images` | Gallery photos |
| `notice-attachments` | Notice images/attachments |
| `site-assets` | Logo, favicon and social sharing image |

Buckets are publicly readable. Uploads and deletes require a signed-in admin (`is_admin()`).

## 5. Create the first Super Admin

1. Supabase dashboard → **Authentication → Users → Add user**. Create the account with a password
   (the teacher who will run the club).
2. Copy the new user's UUID, then run in the SQL editor:

   ```sql
   insert into public.admin_users (id, email, role)
   values ('<paste-the-user-uuid>', 'advisor@example.com', 'super_admin');
   ```

3. Sign in at `/admin/login`. From **Admin Users** you can invite the rest of the committee and
   assign them the `editor` role.

Editors can manage members, events, notices, gallery and applications. Only Super Admins can manage
admin users or change site settings — enforced by UI, server actions **and** RLS.

## 6. Seed development data

```bash
npm run seed          # insert / update seed rows
npm run seed:reset    # wipe existing rows first
```

Review photos and applications are seeded with clearly fictional content for local development. Don't
run the seed against a production database.

> Without Supabase credentials the app runs in **read-only preview mode**: every page renders the
> curated seed content so the whole UI can be reviewed, but all writes are refused server-side.

## 7. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## 8. Build

```bash
npm run typecheck
npm run lint
npm run build
npm start
```

## 9. Deploy to Vercel

1. Push the repository to GitHub.
2. Import it in Vercel.
3. Add the environment variables from step 2 (Production + Preview).
4. Deploy. The framework preset is detected automatically.

`NEXT_PUBLIC_SITE_URL` should be the final `https://…vercel.app` or custom domain — it feeds
canonical URLs, `sitemap.xml` and `robots.txt`.

## 10. Custom domain

Vercel → Project → Settings → Domains → add the domain and follow the DNS instructions. Update
`NEXT_PUBLIC_SITE_URL` afterwards so metadata stays correct.

## 11. Environment variables

See `.env.example`. Only `NEXT_PUBLIC_*` values reach the browser. `SUPABASE_SERVICE_ROLE_KEY` is
used exclusively by `scripts/seed.mjs` and admin invitations on the server.

## 12. Security architecture

Authorization is enforced at three layers that agree with each other:

| Layer | Mechanism |
|---|---|
| UI | Role-aware sidebar and pages hide what you cannot use |
| Server | `src/lib/auth.ts` guards every server action; `src/middleware.ts` redirects unauthenticated `/admin/*` |
| Database | RLS policies in `0002_rls.sql` reject unauthorized operations even through the raw API |

Public visitors can read published content and submit an application — nothing else. They can never
read `applications`, `admin_users` or write to any table. An editor who calls the Supabase API
directly still cannot modify admin users or settings.

Public pages and the admin read from the same tables (`src/lib/data.ts` is the single source of
truth), so anything published in `/admin` appears on the site immediately.

---

## Project structure

```
src/
├── app/
│   ├── (site)/            Public pages: home, about, events, journey, gallery, team, notices, join
│   ├── admin/
│   │   ├── login/          Supabase Auth sign-in
│   │   └── (panel)/        Authenticated CMS: dashboard, members, events, journey, notices, gallery,
│   │                       applications, settings, admin-users
│   ├── api/                Public application form + admin-only CSV export
│   ├── sitemap.ts, robots.ts
│   └── layout.tsx          Fonts, theme provider, Organization JSON-LD
├── components/            site/, ui/, events/, gallery/, notices/, admin/
└── lib/
    ├── data.ts            Single source of truth for reads
    ├── auth.ts            Server-side role guards
    ├── validation.ts      Zod schemas shared by forms and actions
    ├── seed.ts            Seed content (also the preview fallback)
    ├── upload.ts          Client-side image resize/compress + storage upload
    └── supabase/          Browser, server and middleware clients
supabase/migrations/       Schema, RLS and storage configuration
scripts/seed.mjs           Development seed script
```

## Notes for future committees

- Every event needs **both** a Bikram Sambat and an AD date; they are shown together as
  `2083 BS (2026)` everywhere.
- The Journey timeline is built from **completed** events only.
- Gallery captions and alt text are required — uploads are rejected without them.
- Photos are resized and converted to WebP in the browser before upload.
- Only upload photos the school has approved for public posting, especially where students are visible.
