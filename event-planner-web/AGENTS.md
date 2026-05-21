# Event Planner – Next.js App

Event planner app: manage groups and events (users create groups, group managers create events in the groups, group members view events and RSVP to events, comment and share event links)

## Technologies

- Next.js + Neon DB + Drizzle ORM + React + Tailwind
- Authentication: JWT tokens + bcrypt (stored in HTTP-only cookies)
- Object storage: Cloudflare R2 (for user photos and event images)
- Deployment: Netlify (serverless) + Neon DB (serverless PostgreSQL)

## Project Structure

```
event-web/
  src/
    app/                  → Next.js pages and routes
      (auth)/             → login / register pages (public)
      (main)/             → protected pages (require login)
        dashboard/        → user dashboard (active + past events)
        groups/           → group list, group details, create/edit group
        events/           → event details, join/leave/comment
        profile/          → user profile page
        admin/            → admin panel (admin role only)
      api/                → RESTful API endpoints (for Expo mobile app)
        auth/             → POST /api/auth/login, POST /api/auth/register
        events/           → GET/POST /api/events, /api/events/[id]/rsvp, /api/events/[id]/leave
        comments/         → GET/POST/PUT/DELETE /api/events/[id]/comments
        docs/             → GET /api/docs (API documentation as HTML)
    services/             → business logic (groupService, eventService, userService, commentService, adminService)
    db/                   → Drizzle schema (schema.ts) and seed script (seed.ts)
    drizzle/              → Drizzle Kit migration files
    lib/                  → shared utilities (auth.ts, jwt.ts, storage.ts)
    components/           → reusable UI components (Header, Footer, EventCard, GroupCard, CommentList…)
```

## Architectural Guidelines

- **Service layer**: implement all business logic in `src/services/`. Services are consumed by both Server Actions and RESTful API route handlers. Never put business logic directly in pages or API routes.
- **Modular design**: split the app into self-contained components and services. Each file should have a single clear responsibility. Avoid large files with too much code.
- **Server Actions**: use for all Web app form submissions and mutations (create/edit/delete group, create/edit/delete event, RSVP, comment).
- **RESTful API**: use only for the Expo mobile app. All mobile endpoints live under `src/app/api/`. Use Bearer token auth for all API endpoints.
- **Auth**: JWT tokens + bcrypt. Store JWT in HTTP-only cookies for the Web app. Use `Authorization: Bearer <token>` header for the mobile API.
- **Database**: Neon DB + Drizzle ORM. Always use Drizzle Kit migrations to change the DB schema — never edit the DB directly. Use `npm run db:generate` and `npm run db:migrate`.
- **Middleware**: protect all routes except `/`, `/login`, `/register` and `/api/auth/*`. Redirect unauthenticated users to `/login?redirect=<original_url>`.

## Database Schema

Six core tables (use integer IDs, not UUIDs):

- **users** – id, name, email, passwordHash, photoUrl, role (user | admin), createdAt
- **groups** – id, title, description, createdBy, createdAt
- **group_members** – id, groupId, userId, isManager, joinedAt
- **events** – id, groupId, title, description, eventType, date, time, location, capacity (default 12), canceled, createdBy, createdAt
- **event_rsvps** – id, eventId, userId, extraSlots (0–3), rsvpAt
- **event_comments** – id, eventId, userId, text, createdAt, updatedAt
- **group_invitations** – id, groupId, inviteCode, usedAt, usedByUserId, createdAt

Always create DB indexes on foreign keys and frequently queried fields (groupId, eventId, userId).

## Event State Logic

An event has one of three states — compute this at query time, never store it:

- **upcoming** – event date+time is in the future
- **ongoing** – event has started and less than 1 hour has passed since start time
- **past** – more than 1 hour has passed since start time

An event is **open for RSVP** when it is `upcoming` or `ongoing` AND `canceled = false`.

Capacity states: **under capacity** | **full** (joined == capacity) | **over capacity** (joined > capacity). Do not block RSVP when full — let members decide.

## User Roles and Authorization

| Role | What they can do |
|------|-----------------|
| **Visitor** | View home page, register, login |
| **User** | Manage own profile, create groups, accept group invitations |
| **Group Member** | View group events, RSVP (going/not going), add extra slots (+1/+2/+3), comment, share event link |
| **Group Manager** | Create/edit/cancel/delete events, invite members (invite link), promote/demote managers, remove members |
| **Admin** | View and manage all users, groups and events via admin panel at `/admin` |

Always enforce authorization checks in:
1. Service layer (primary check)
2. API route handlers (for REST endpoints)
3. Next.js middleware (route-level protection)

## User Interface Guidelines

- Implement **modern, clean UI** with Tailwind CSS. Use consistent spacing, color palette and typography.
- **Responsive design**: support desktop, tablet and smartphone screen sizes.
- **Server-rendered components** by default. Only use `"use client"` for forms, interactive buttons (RSVP, join/leave), and real-time UI updates.
- Use **icons** (e.g. lucide-react) and **visual cues** to show event state: badges for upcoming/ongoing/past/canceled, capacity indicators, player count.
- Split UI into **small reusable components**: `EventCard`, `GroupCard`, `CommentItem`, `RSVPButton`, `MemberList`, `InviteLink`, etc.
- **Loading and error states**: show skeleton loaders or spinners for async data. Show clear error messages for failed actions.
- After login, redirect to `/dashboard`. After logout, redirect to `/`.

## Pages and Navigation

Minimum 10 screens required:

1. `/` – Home page (public): welcome + login/register buttons
2. `/(auth)/login` – Login form
3. `/(auth)/register` – Register form
4. `/dashboard` – User dashboard: active events (upcoming/ongoing) + archive (past/canceled)
5. `/profile` – View and edit own profile (name, photo)
6. `/groups` – List user's groups
7. `/groups/[id]` – Group details: info, members, events, invite link (managers)
8. `/groups/new` – Create new group
9. `/groups/[id]/edit` – Edit group (managers only)
10. `/events/[id]` – Event details: info, RSVP, extra slots, player list, comments, share link
11. `/groups/[id]/events/new` – Create event (managers only)
12. `/groups/[id]/events/[id]/edit` – Edit/cancel event (managers only)
13. `/groups/[id]/join?code=…` – Accept group invitation
14. `/admin` – Admin panel: manage all users, groups, events (admin role only)

## RESTful API (for Expo mobile app)

All endpoints require `Authorization: Bearer <jwt>` except auth endpoints.
Implement server-side paging on all list endpoints (`?page=1&limit=20`).

```
POST   /api/auth/login              → login, returns JWT token
POST   /api/auth/register           → register, returns JWT token
GET    /api/events                  → list active events (upcoming + ongoing), with paging
GET    /api/events/[id]             → event details (state, capacity, isRsvped, players, comments)
POST   /api/events/[id]/rsvp        → RSVP to event (if not already)
POST   /api/events/[id]/leave       → leave event (if RSVPed)
POST   /api/events/[id]/slots       → update extra slots (0, 1, 2 or 3)
GET    /api/events/[id]/comments    → list comments for event
POST   /api/events/[id]/comments    → post a comment
PUT    /api/events/[id]/comments/[cid] → edit own comment
DELETE /api/events/[id]/comments/[cid] → delete comment (owner or manager)
GET    /api/docs                    → API documentation as HTML
```

## Scalability

- Implement **server-side paging** for all list views: events in dashboard, groups list, members list, comments list.
- Seed the DB with **at least 10,000 records** across primary tables to validate performance.
- Create **DB indexes** on `groupId`, `eventId`, `userId`, `date`, `canceled` columns.
- Performance test targets: 500 groups, 5,000 events in first 3 groups, 3,000 users.

## Key Commands

```bash
npm run dev          # start Next.js dev server
npm run build        # build for production
npm run db:generate  # generate Drizzle migration from schema changes
npm run db:migrate   # apply pending migrations to Neon DB
npm run db:seed      # seed sample data
npm run db:studio    # open Drizzle Studio (DB browser)
```

## Environment Variables

```
DATABASE_URL=<neon_db_connection_string>
JWT_SECRET=<random_secret_min_32_chars>
CLOUDFLARE_R2_ACCOUNT_ID=<r2_account_id>
CLOUDFLARE_R2_ACCESS_KEY=<r2_access_key>
CLOUDFLARE_R2_SECRET_KEY=<r2_secret_key>
CLOUDFLARE_R2_BUCKET=<bucket_name>
NEXT_PUBLIC_APP_URL=<deployed_app_url> 

# Отговаряй ми винаги на Български език.

```
