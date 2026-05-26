# Capstone Project — "Full Stack Apps with AI"

Multi-platform full-stack Event Planner built with Next.js (back-end + Web),
Neon PostgreSQL, Drizzle ORM and Expo (mobile), implemented with AI-assisted
development.

---

## Submission Header

| Field | Value |
|-------|-------|
| **Author** | Nikolay Stoyanov |
| **Email** | lobido1988@gmail.com |
| **GitHub Repo** | https://github.com/Niko5886/event-planner |
| **Web Project Live URL** | https://eventplannerns.netlify.app/ 
| **Expo Project Live URL** | https://eventplannermobile.netlify.app/   
| **Sample credentials** | `admin@demo.com / demo123` &nbsp;·&nbsp; `manager@demo.com / demo123` &nbsp;·&nbsp; `member@demo.com / demo123` | hristo.yordanov40@example.com / demo123 , ivan.marinov39@example.com / demo123 .

---

## Self-Assessment (estimated score)

| # | Criterion | Max | My Score | Evidence |
|---|-----------|----:|---------:|----------|
| 1 | GitHub Commits (≥15) | 15 | **15** | 41 commits in `main` history |
| 2 | GitHub Commit Days (≥3) | 15 | **15** | 5 distinct days (May 20–24, 2026) |
| 3 | Architecture | 5 | **5** | npm monorepo: `event-planner-web` (Next.js back-end + Web) + `event-planner-mobile` (Expo) + `event-planner-shared`. REST API + Server Actions. |
| 4 | Backend | 5 | **5** | Service layer in `src/services/`, REST endpoints in `src/app/api/`, JWT + bcrypt auth |
| 5 | Database (≥4 tables) | 5 / 8 | **5** | 7 tables: users, groups, group_members, group_invitations, events, event_rsvps, event_comments. Drizzle migrations committed in `drizzle/`. |
| 6 | Users & Roles | 5 | **5** | bcrypt-hashed passwords, JWT in HTTP-only cookies (Web) / Bearer header (mobile), `user_role` enum, middleware-enforced route protection |
| 7 | Scalability | 5 | **5** | Server-side paging (`apiPaging.ts`); `db:seed:large` produces 3,000 users / 500 groups / 5,000 events / ~30k records total; indexes on all FKs and hot columns |
| 8 | Web App (≥10 screens) | 15 | **15** | 14 screens — home, login, register, dashboard, profile, groups list, group details, new group, group edit, join, event details, edit event, new event, admin |
| 9 | Admin Panel | 5 | **5** | `/admin` route gated to `admin` role: overview stats + recent users/groups/events tables with delete actions |
| 10 | Mobile App (≥5 screens) | 15 | **15** | 6 screens — index, login, register, events list, event details, layout |
| 11 | Deployment | 5 | **5** | Netlify config (`netlify.toml`) for both sites, Neon serverless DB, full step-by-step guide in `DEPLOYMENT.md` |
| 12 | Documentation | 5 | **5** | `README.md`, `AGENTS.md`, `DEPLOYMENT.md`, `docs/database-schema.md` (Mermaid ERD), per-workspace READMEs |
| **Total (core)** | | **100** | **100** | |
| — File Uploads (bonus) | — | — | Not implemented |
| — Automated Tests (bonus) | — | partial | Integration script `scripts/integration-slots-test.js` + GitHub Actions CI (`.github/workflows/ci.yml`) running lint + build + typecheck + Expo Web export on every push/PR |
| — Backups (bonus) | — | — | Not implemented |

---

## How to verify each criterion

```bash
# 1, 2 — commit history
git log --oneline | wc -l                  # ≥ 15
git log --format="%ad" --date=short | sort -u

# 5 — database schema and migrations
ls event-planner-web/drizzle/*.sql
cat event-planner-web/src/db/schema.ts

# 7 — scalability (run against a Neon production DB)
cd event-planner-web
npm run db:seed:large

# 8 — Web screens
find event-planner-web/src/app -name "page.tsx"

# 10 — Mobile screens
ls event-planner-mobile/src/app/*.tsx

# CI (bonus)
cat .github/workflows/ci.yml
```

---

## Tech Summary

| Layer | Tech |
|-------|------|
| Back-end | Next.js 16 (App Router, Server Actions, API Routes) |
| Database | Neon serverless PostgreSQL + Drizzle ORM + Drizzle Kit migrations |
| Web client | Next.js + React 19 + TypeScript + Tailwind 4 |
| Mobile | Expo (Expo Router) + React Native + TypeScript |
| Auth | JWT + bcryptjs (HTTP-only cookies / Bearer header) |
| Hosting | Netlify (two sites: Next.js + Expo Web export) |
| CI | GitHub Actions (lint + build + typecheck) |
