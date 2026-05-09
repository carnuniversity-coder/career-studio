# Phase 3 - Resume Engine

- Added resume domain helpers in `src/lib/resume-content.ts`, `src/lib/resume-templates.ts`, and `src/server/services/resumes/*`.
- Added resume list/create/editor routes, autosave, version snapshots, drag-drop section ordering, AI summary rewrites, and live preview.
- Added ATS scoring route and client upload flow with Sri Lanka-friendly deterministic scoring, score bands, and JD keyword overlap.
- Added cover-letter generation, editable drafts, version snapshots, and PDF/DOCX export routes.
- Added GCV create/edit routes with theme controls and graphical preview.
- Added `@react-pdf/renderer` PDF documents and `docx` export plumbing for resumes and cover letters.
- Added `react-dropzone` and isolated `file-type` MIME detection to upload-only server actions.
- Added Phase 3 English/Sinhala/Tamil message namespaces with English fallback where full translations are still pending.
- Models touched: no Prisma schema changes; reused Phase 0 `Resume`, `ResumeContent`, `ResumeVersion`, `CVDocument`, `ATSCheckResult`, `CoverLetter*`, and `GCVResume` models.
- Verified: `npm run lint`, `npx tsc --noEmit`, `npx prisma validate`, and `npm run build`.
- Smoke checked unauthenticated `/en/resumes`, `/en/ats`, `/en/cover-letter`, `/en/gcv`, plus export APIs; routes redirect or return 401 as expected.
- Deferred: authenticated browser smoke with a real Supabase/Postgres user session.
- Deferred: robust PDF/DOCX text extraction for ATS uploads; current path mirrors the static scoring path and falls back to text decoding.
- Deferred: Gemini-augmented ATS scoring path and full GCV export flow.
