# Event Planner Web

The Next.js web app provides both the UI and the backend APIs. It is the primary application in the monorepo.

## Local Development

From the repo root, run:

```
npm install
npm run dev
```

Or run the web app only:

```
npm run dev -w event-planner-web
```

## Environment Variables

Create `event-planner-web/.env` with:

```
DATABASE_URL=postgresql://<user>:<pass>@<host>/<db>?sslmode=require
JWT_SECRET=<random_secret_min_32_chars>
```

## Database

Run migrations and seed data:

```
npm run db:migrate -w event-planner-web
npm run db:seed -w event-planner-web
```

## Sample Credentials

Use these demo accounts after seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123 |
| Group Manager | manager@demo.com | demo123 |
| Group Member | member@demo.com | demo123 |

## More Documentation

See the root `README.md` for architecture, schema, and full setup instructions.
