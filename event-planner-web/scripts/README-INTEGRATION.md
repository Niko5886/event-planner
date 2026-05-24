Integration tests for RSVP/slots flows

Usage:

Set a valid JWT in `TEST_TOKEN` and the API base (optional) then run:

```powershell
$env:TEST_TOKEN = "<your-jwt>"
node scripts/integration-slots-test.js
```

Or on UNIX shells:

```bash
TEST_TOKEN="<your-jwt>" API_BASE=http://localhost:3000/api node scripts/integration-slots-test.js
```

Notes:
- The script hits `/events/:id` endpoints on the running dev server.
- Use a token for a user that exists in the local DB and has appropriate permissions.
