<h1 align="center">Event Planner</h1>

<p align="center"><em>Plan together. Show up together.</em></p>

<p align="center">
  A multi-platform full-stack app for friends, colleagues and communities to
  <strong>plan and organize shared events</strong> — parties, hikes, dinners, sports and more.<br/>
  Create groups, announce events, RSVP with +1s, comment, and share invite links.
</p>

<p align="center">
  <a href="https://event-planner-event-planner-web.vercel.app">
    <img src="https://img.shields.io/badge/%F0%9F%8C%90%20Live%20Demo%20%E2%86%92-Open%20the%20app-7c3aed?style=for-the-badge&labelColor=1e1b2e" height="34" alt="Live Demo" />
  </a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-4-38BDF8?logo=tailwindcss&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-0B0B0B?logo=drizzle&logoColor=C5F74F" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-4169E1?logo=postgresql&logoColor=white" alt="PostgreSQL / Neon" />
  <img src="https://img.shields.io/badge/Expo-React_Native-000020?logo=expo&logoColor=white" alt="Expo React Native" />
</p>

<p align="center">
  <img src="docs/screenshot.png" alt="Event Planner — plan events with your friends" width="100%" />
</p>

---

**Event Planner** lets users create **groups** where events are organized and managed. Group
managers announce events, and members RSVP, bring friends (+1 / +2 / +3), leave comments, and
share event links with others.

---

## Who Can Do What

### Visitors
Anonymous users who visit the app website.
- View the public home page
- Register a new account (email + password)

### Registered Users
Users with a profile (name, email, optional photo) who can log in and out.
- Manage their own profile
- Create new groups (automatically becoming group manager)
- Join existing groups via an invitation link shared by a group manager

### Group Members
Registered users who have joined a group.
- Browse all events in their groups: upcoming, ongoing and past
- See the state of each event: **upcoming** | **ongoing** | **past**, with notes for canceled, full, under or over capacity
- RSVP to an event (going) or cancel their RSVP (not going)
- Reserve extra slots when joining (+1 / +2 / +3 friends)
- Post, edit and delete their own comments on events
- Share a direct link to any event

### Group Managers
Group members with elevated permissions to manage the group.
- Create, edit, cancel and delete events in their group
- Invite new members by generating and sharing an invite link
- Promote group members to manager or demote managers to regular members
- Remove members from the group

### Admins
Special platform-level users with full oversight.
- View and manage all users, groups and events via a dedicated admin panel

---

## Events

Each event belongs to a group and holds the following information:
- **Title** and **description**
- **Event type** (e.g. party, hike, dinner, sports, other)
- **Date**, **time** and **location**
- **Capacity** – maximum number of participants (default: 12)
- **Canceled** flag – set by a group manager if the event will not take place

### Event States
An event is always in one of three states, computed from its date and time:
- **Upcoming** – the start time has not yet been reached
- **Ongoing** – the event has started and less than 1 hour has passed
- **Past** – more than 1 hour has passed since the start time

An event is **open for RSVP** when it is upcoming or ongoing and has not been canceled. Members are not blocked from joining a full event – they decide among themselves how to handle over-capacity situations.

---

## Web App and Mobile App

### Web App (primary)
The full-featured application built with Next.js and React. Implements the entire platform: user management, group management, event management, RSVP, comments, invite links and admin panel.

### Mobile App (companion)
A scope-limited React Native / Expo app focused on the core member experience: login, register, browse events, RSVP to events, and comment on events.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | Next.js (API routes + Server Actions) |
| Database | PostgreSQL – Neon DB (serverless) |
| ORM | Drizzle ORM |
| Frontend | Next.js + React + TypeScript + Tailwind CSS |
| Mobile | React Native + Expo |
| Auth | JWT tokens + bcrypt |
| File storage | Cloudflare R2 (user photos) |
| Deployment | Netlify (serverless) |

---

## Architecture Overview

- Next.js Web app provides UI plus server-side logic (Server Actions + API routes).
- Expo mobile app consumes the REST API exposed by the Web app.
- Business logic lives in a service layer consumed by both Server Actions and API routes.
- PostgreSQL (Neon) is accessed via Drizzle ORM and migrations.

---

## Repo Structure

```
event planner/
	AGENTS.md
	README.md
	package.json
	event-planner-web/
		src/
			app/            # Next.js UI + API routes
			services/       # Business logic layer
			db/             # Drizzle schema + seeds
		drizzle/          # Migrations
		README.md
	event-planner-mobile/
		src/              # Expo app source
		README.md
	event-planner-shared/
		src/              # Shared types/utilities
```

---

## Database Schema (High Level)

7 tables — full schema with columns, indexes and constraints is in
[`docs/database-schema.md`](docs/database-schema.md).

```mermaid
erDiagram
	users ||--o{ groups : creates
	users ||--o{ group_members : joins
	groups ||--o{ group_members : has
	groups ||--o{ group_invitations : invites
	users ||--o{ group_invitations : uses
	groups ||--o{ events : hosts
	users ||--o{ events : creates
	events ||--o{ event_rsvps : has
	users ||--o{ event_rsvps : rsvps
	events ||--o{ event_comments : has
	users ||--o{ event_comments : writes
```

---

## Local Development Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database (Neon recommended)

### Environment Variables

Create the following files:

`event-planner-web/.env`

```
DATABASE_URL=postgresql://<user>:<pass>@<host>/<db>?sslmode=require
JWT_SECRET=<random_secret_min_32_chars>
```

`event-planner-mobile/.env`

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

### Install and Run

From the repo root:

```
npm install
npm run dev
```

Alternative: run apps separately

```
npm run dev -w event-planner-web
npm run start -w event-planner-mobile
```

### Database Migrations and Seed

```
npm run db:migrate     -w event-planner-web
npm run db:seed        -w event-planner-web   # small curated demo (18 users, 4 groups, 10 events)
npm run db:seed:large  -w event-planner-web   # ~30k records for scalability validation
```

### Expo Web Export

Generate a static web build for the mobile app:

```
npm run export:web -w event-planner-mobile
```

---

## Key Folders and Files

- `event-planner-web/src/app`: Next.js routes, pages, and API endpoints.
- `event-planner-web/src/services`: Business logic for groups, events, RSVP, comments.
- `event-planner-web/src/db`: Drizzle schema, DB helpers, and seed script.
- `event-planner-web/drizzle`: Drizzle migrations.
- `event-planner-mobile/src`: Expo mobile app screens and components.
- `event-planner-shared/src`: Shared types and utilities across web/mobile.

---

## Sample Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123 |
| Group Manager | manager@demo.com | demo123 |
| Group Member | member@demo.com | demo123 |

---

## Deployment

See [`DEPLOYMENT.md`](DEPLOYMENT.md) for the full Netlify + Neon deployment guide,
including environment variables, the Expo Web export site, and (optional) the
Android APK build via Expo EAS.

## Further Reading

- [`AGENTS.md`](AGENTS.md) — AI agent rules and architecture invariants
- [`docs/database-schema.md`](docs/database-schema.md) — full DB schema
- [`DEPLOYMENT.md`](DEPLOYMENT.md) — production deployment
- [`event-planner-web/README.md`](event-planner-web/README.md) — Web app dev
- [`event-planner-mobile/README.md`](event-planner-mobile/README.md) — Mobile app dev