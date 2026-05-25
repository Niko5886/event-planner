# Deployment Guide

This monorepo deploys as **two separate Netlify sites** that share one Neon PostgreSQL database:

| Site | Source folder | Output | Purpose |
|------|---------------|--------|---------|
| `event-planner-web` | `event-planner-web/` | `.next` | Next.js back-end **+** Web client |
| `event-planner-mobile` | `event-planner-mobile/` | `dist` | Expo Web export of the mobile app |

---

## 1. Prepare the Neon database

1. Create a free Neon project at <https://neon.tech>.
2. From **Dashboard → Connection Details**, copy the **pooled** connection string (must end in `?sslmode=require`).
3. Run migrations and seed locally against the production DB once:

   ```bash
   cd event-planner-web
   echo "DATABASE_URL=postgresql://..." > .env
   echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env
   npm run db:migrate
   npm run db:seed           # small demo data
   # or
   npm run db:seed:large     # ~30k records for scalability validation
   ```

---

## 2. Deploy the Next.js Web site

1. <https://app.netlify.com> → **Add new site → Import an existing project**.
2. Pick this GitHub repo. **Base directory** is auto-detected from `event-planner-web/netlify.toml` (`event-planner-web`).
3. **Site settings → Environment variables**, add:

   | Key | Value |
   |-----|-------|
   | `DATABASE_URL` | Neon pooled URL (with `sslmode=require`) |
   | `JWT_SECRET` | 32+ random chars |
   | `NEXT_PUBLIC_APP_URL` | `https://<this-site>.netlify.app` |

4. Trigger **Deploy site**. Netlify auto-installs `@netlify/plugin-nextjs` (already wired in `netlify.toml`).
5. After the first deploy, copy the public URL — you'll need it for the mobile site.

---

## 3. Deploy the Expo mobile site (Web export)

1. Netlify → **Add new site → Import an existing project** → same repo.
2. **Base directory:** `event-planner-mobile` (set in `event-planner-mobile/netlify.toml`).
3. **Environment variable:**

   | Key | Value |
   |-----|-------|
   | `EXPO_PUBLIC_API_BASE_URL` | `https://<web-site>.netlify.app/api` |

4. Deploy.

The SPA fallback redirect (`/* → /index.html 200`) in `netlify.toml` keeps Expo Router's client-side routes working on refresh.

---

## 4. (Optional) Android APK via Expo EAS

```bash
cd event-planner-mobile
npx eas build --platform android --profile preview
```

Upload the resulting `.apk` to the GitHub **Releases** section of this repo.

---

## 5. Post-deploy smoke test

| URL | Expected |
|-----|----------|
| `https://<web>/` | Public home page renders |
| `https://<web>/api/docs` | API documentation HTML |
| `https://<web>/login` | Login form |
| `https://<mobile>/` | Expo app loads, can log in with demo credentials |

**Demo credentials (after `db:seed` or `db:seed:large`):**

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@demo.com` | `demo123` |
| Manager | `manager@demo.com` | `demo123` |
| Member | `member@demo.com` | `demo123` |

---

## Troubleshooting

- **`DATABASE_URL is not set`** — env var not propagated; redeploy after saving in Netlify dashboard.
- **`relation "users" does not exist`** — run `npm run db:migrate` from a machine with `DATABASE_URL` pointing at Neon production.
- **Mobile site shows blank page** — verify `EXPO_PUBLIC_API_BASE_URL` is set and the SPA redirect is in place.
- **CORS errors from mobile site** — the web app already returns wildcard CORS for `/api/*`; check the API URL is correct.
