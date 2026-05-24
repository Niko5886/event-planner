# Event Planner Mobile

Expo app focused on the core group member experience: login, browse events, RSVP, and comments.

## Local Development

From the repo root, run:

```
npm install
npm run dev
```

Or run the mobile app only:

```
npm run start -w event-planner-mobile
```

## Environment Variables

Create `event-planner-mobile/.env` with:

```
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
```

## Sample Credentials

Use these demo accounts after seeding the database:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@demo.com | demo123 |
| Group Manager | manager@demo.com | demo123 |
| Group Member | member@demo.com | demo123 |

## Web Export

Generate a static web build (output goes to `dist/`):

```
npm run export:web -w event-planner-mobile
```

## More Documentation

See the root `README.md` for architecture, schema, and full setup instructions.
