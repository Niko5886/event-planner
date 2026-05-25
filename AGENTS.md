# Event Planner — AI Agent Instructions

Event Planner is a multi-platform app for planning group events (parties, hikes,
dinners, sports). Users create groups, group managers create events, group members
RSVP and comment.

## Repo layout (npm monorepo)

| Workspace | Purpose |
|-----------|---------|
| `event-planner-web` | Next.js back-end + Web client (the source of truth for business logic) |
| `event-planner-mobile` | Expo Router mobile app — consumes the REST API from `event-planner-web` |
| `event-planner-shared` | Small set of shared TypeScript types used by both apps |

Each workspace has its own `AGENTS.md` with workspace-specific guidance — read it before touching files there.

## Core rules

- **DB schema changes ALWAYS go through Drizzle migrations.** Never edit the DB directly. Use `npm run db:generate` then `npm run db:migrate` from `event-planner-web`.
- **Business logic lives in `event-planner-web/src/services/`.** Server Actions and API route handlers both call services — never put DB queries in pages or routes.
- **Auth model:** JWT + bcrypt. Web app uses HTTP-only cookies; mobile app uses `Authorization: Bearer <token>` header. Same `JWT_SECRET` for both.
- **Paging is required** on every list endpoint and list UI. Default 20, max 100. See `src/lib/apiPaging.ts`.
- **Event state is computed, not stored.** `upcoming | ongoing | past` is derived from `date + time` at query time. RSVP is open when not `canceled` and state is `upcoming` or `ongoing`.
- **Authorization is enforced in three places:** service layer (primary), API route handler, and Next.js middleware. Never rely on just one.

## When making changes

- Web feature → add/update a service, wire it from a Server Action **and** the matching REST endpoint if the mobile app needs it.
- Mobile feature → only call the existing REST API from `event-planner-web/src/app/api/`. Never add Drizzle imports to the mobile workspace.
- Adding a new DB table → update `src/db/schema.ts`, run `db:generate`, commit the generated SQL in `drizzle/`, then update `src/db/seed.ts` and `src/db/seed-large.ts`.

## Run / build

```bash
npm run dev               # both apps concurrently (from repo root)
npm run build             # build both workspaces

# Web only:
npm run dev      -w event-planner-web
npm run db:migrate -w event-planner-web
npm run db:seed       -w event-planner-web   # small demo
npm run db:seed:large -w event-planner-web   # ~30k records

# Mobile only:
npm run start      -w event-planner-mobile
npm run export:web -w event-planner-mobile   # static web build for Netlify
```

See `DEPLOYMENT.md` for production deployment to Netlify + Neon.
