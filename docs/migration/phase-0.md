# Phase 0 - Scaffold

- Created the Next.js 15 App Router scaffold with TypeScript, Tailwind CSS, shadcn/ui primitives, and Lucide icons.
- Added Next/Auth.js plumbing in `src/lib/auth.ts` and `src/app/api/auth/[...nextauth]/route.ts`.
- Added next-intl locale routing for `en`, `si`, and `ta` with message catalogues converted from Django `.po` seeds.
- Added public and authenticated shell layouts, language switcher, public nav, footer, and app sidebar.
- Added placeholder public, auth, dashboard, feature, and API routes under the `[locale]` segment.
- Added `src/lib/prisma.ts`, `ai.ts`, `currency.ts`, `validators.ts`, `ats-scoring.ts`, and `inngest.ts`.
- Added the initial Prisma 7 config, schema, generated migration SQL, and seed script.
- Prisma models touched: all Phase 0 mirror models from accounts, resumes, ATS, cover letters, GCV, jobs, interview, salary, CareerGPS, LinkedIn, courses, resources, blog, content, social, messaging, forum, connections, notifications, billing, feedback, and AI logs.
- Seed script covers Sri Lankan COL, salary ranges, local courses, certifications, interview questions, optional CSV course import, and optional tools fixture import.
- Added a Zod-backed Server Action stub for resume creation to establish the mutation pattern.
- Checks passed: `npm run build`, `npm run lint`, `npx tsc --noEmit`, `npx prisma validate`, and `npx prisma generate`.
- Dev smoke loaded 29 English Phase 0 routes on `localhost:3000` with HTTP 200 responses.
- `prisma migrate dev --name init --create-only` was attempted but needs a reachable PostgreSQL/Supabase URL; offline SQL was generated with `prisma migrate diff`.
- Deferred: real auth forms, database-backed mutations, prompts/AI feature ports, billing webhooks, and route-level auth gates.
