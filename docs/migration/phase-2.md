# Phase 2 - Auth and Onboarding

- Added Auth.js email-link and Google flows with locale-aware sign-in, sign-up, recovery, and verify-request pages.
- Added account creation Server Actions with Zod validation, referral-code capture, profile creation, and Google fallback messaging when env is not configured.
- Added profile settings with editable name, phone, LinkedIn URL, email update, plan display, quota cards, referral code, and current-session sign out.
- Added `PlanTierBadge`, plan limit helpers, account service helpers, and Auth.js JWT session typing for UUID user IDs and plan tier.
- Added middleware gating for authenticated app routes plus Pro/Premium route checks for `career-gps`, `gcv`, `linkedin`, `messaging`, and `connections`.
- Added lightweight Terms and Privacy pages so signup legal links resolve.
- Updated `messages/en.json`, `messages/si.json`, and `messages/ta.json` with `phase2` message keys.
- Models touched: none. Existing Prisma auth/user/profile models were used as-is.
- Deferred: password-based credentials, full account deletion/export, profile image upload to Supabase Storage, detailed email templates, and production Google/Resend env verification.
- Note: `npm run build` exits 0, but Next.js reports an Auth.js/Jose Edge Runtime warning from middleware bundling; revisit when hardening middleware/runtime configuration.
- Validation: `npm run lint`, `npx tsc --noEmit`, `npx prisma validate`, and `npm run build` pass.
- Dev smoke: Playwright loaded auth/legal routes and verified `/en/dashboard` redirects to sign-in.
