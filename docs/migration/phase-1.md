# Phase 1 - Public Marketing Pages

- Added static public pages for landing, pricing, tools, resources, courses, course diplomas, course tools, course cities, saved courses, blog index, and blog post detail.
- Added shared public content data in `src/lib/public-content.ts` for Sri Lanka-first copy, LKR pricing, course samples, tools, resources, and blog posts.
- Added marketing components for section headings, course tabs, and course cards.
- Updated `messages/en.json`, `messages/si.json`, and `messages/ta.json` with the `phase1` namespace used by page metadata and visible shell copy.
- Copied public image assets from the Django reference into `public/images/` for the landing preview and OpenGraph image.
- Added per-route SEO metadata, including blog article OpenGraph metadata.
- Kept paid pricing actions and unfinished tools disabled instead of linking to unfinished flows.
- Course and blog filters are server-rendered GET forms, not client islands.
- Models touched: none. Prisma schema was not changed in this phase.
- Deferred: real database-backed public content, resource downloads, course save actions, blog comments, and dynamic CMS/admin editing.
- Validation: `npm run lint`, `npx tsc --noEmit`, `npx prisma validate`, and `npm run build` pass.
- Dev smoke: loaded 14 Phase 1 routes on `localhost:3000` with Playwright and no console errors.
