# Phase 5 - Social + Community

## Added

- Direct messages at `/[locale]/messaging` with conversation listing, send/archive actions, 10MB attachment validation, and message notifications.
- Forum at `/[locale]/forum` plus `/[locale]/forum/[threadId]` with seeded role rooms, thread creation, replies, voting, flags, and reply notifications.
- Connections at `/[locale]/connections` with member discovery, connection requests, accept/decline, skill endorsements, and privacy settings.
- Notifications at `/[locale]/notifications` with read state, preferences, and an Inngest daily digest function.
- Mentorship at `/[locale]/mentorship` with mentor profiles, mentorship requests, accept/decline, and session scheduling.

## Models Touched

- Used existing Prisma models for conversations, messages, forum roles/threads/replies/votes/flags, connections, mentorship, and notifications.
- No schema migration was added in this phase.

## Deferred

- Supabase Realtime DM subscriptions are not wired yet; messaging refreshes after each send.
- Conversation participants should become a first-class join table in a future schema cleanup.
- Social event RSVP is deferred because the current Prisma schema does not include the Django through model.
