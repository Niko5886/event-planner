const HTML = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Event Planner API</title>
<style>
  :root {
    color-scheme: light;
    --bg: #f8fafc;
    --card: #ffffff;
    --border: #e2e8f0;
    --text: #0f172a;
    --muted: #475569;
    --indigo: #4f46e5;
    --green: #16a34a;
    --amber: #d97706;
    --red: #dc2626;
    --slate: #64748b;
    --code-bg: #0f172a;
    --code-text: #e2e8f0;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
    background: var(--bg);
    color: var(--text);
    line-height: 1.55;
  }
  .container { max-width: 960px; margin: 0 auto; padding: 32px 24px 80px; }
  header { border-bottom: 1px solid var(--border); padding-bottom: 24px; margin-bottom: 32px; }
  h1 { margin: 0 0 8px; font-size: 28px; }
  header p { margin: 0; color: var(--muted); }
  h2 { margin: 32px 0 12px; font-size: 18px; text-transform: uppercase; letter-spacing: 0.04em; color: var(--slate); }
  .endpoint {
    background: var(--card);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 20px;
    margin-bottom: 14px;
    box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
  }
  .row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; }
  .method {
    display: inline-block;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 12px;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    color: white;
    letter-spacing: 0.04em;
  }
  .method.GET { background: var(--green); }
  .method.POST { background: var(--indigo); }
  .method.PUT { background: var(--amber); }
  .method.DELETE { background: var(--red); }
  .path {
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
  }
  .auth-tag {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 999px;
    background: #fef3c7;
    color: #92400e;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
  .auth-tag.public { background: #dcfce7; color: #166534; }
  .desc { color: var(--muted); margin: 10px 0 0; font-size: 14px; }
  pre {
    margin: 10px 0 0;
    background: var(--code-bg);
    color: var(--code-text);
    padding: 12px 14px;
    border-radius: 8px;
    font-size: 12.5px;
    font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
    overflow-x: auto;
  }
  details summary {
    cursor: pointer;
    color: var(--indigo);
    font-size: 13px;
    margin-top: 8px;
    user-select: none;
  }
  details summary:hover { text-decoration: underline; }
  .params {
    margin: 8px 0 0;
    font-size: 13px;
    color: var(--muted);
  }
  .params code {
    background: #f1f5f9;
    padding: 1px 5px;
    border-radius: 4px;
    font-size: 12px;
    color: var(--text);
  }
  .intro {
    background: #eef2ff;
    border: 1px solid #c7d2fe;
    border-radius: 12px;
    padding: 16px 20px;
    color: #1e1b4b;
    font-size: 14px;
    margin-bottom: 32px;
  }
  .intro code {
    background: white;
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 12.5px;
  }
</style>
</head>
<body>
<div class="container">
  <header>
    <h1>Event Planner API</h1>
    <p>RESTful API for the Expo mobile client.</p>
  </header>

  <div class="intro">
    <strong>Authentication.</strong> Every endpoint outside of <code>/api/auth/*</code> requires
    an <code>Authorization: Bearer &lt;jwt&gt;</code> header. Obtain the token from
    <code>POST /api/auth/login</code> or <code>POST /api/auth/register</code>. All requests and
    responses use JSON. List endpoints accept <code>?page=1&amp;limit=20</code> query parameters
    (max <code>limit</code> is 100).
  </div>

  <h2>Authentication</h2>

  <div class="endpoint">
    <div class="row">
      <span class="method POST">POST</span>
      <span class="path">/api/auth/login</span>
      <span class="auth-tag public">Public</span>
    </div>
    <p class="desc">Log in with email + password. Returns a JWT token and the user profile.</p>
    <details>
      <summary>Example</summary>
<pre>// Request
{ "email": "alice@gmail.com", "password": "demo123" }

// 200 Response
{
  "token": "eyJhbGciOiJI...",
  "user": { "id": 4, "name": "Alice", "email": "alice@gmail.com", "role": "user" }
}</pre>
    </details>
  </div>

  <div class="endpoint">
    <div class="row">
      <span class="method POST">POST</span>
      <span class="path">/api/auth/register</span>
      <span class="auth-tag public">Public</span>
    </div>
    <p class="desc">Register a new user. Returns a JWT token and the created user.</p>
    <details>
      <summary>Example</summary>
<pre>// Request
{ "name": "Jane Doe", "email": "jane@example.com", "password": "secret123" }

// 201 Response
{
  "token": "eyJhbGciOiJI...",
  "user": { "id": 42, "name": "Jane Doe", "email": "jane@example.com", "role": "user" }
}</pre>
    </details>
  </div>

  <h2>Events</h2>

  <div class="endpoint">
    <div class="row">
      <span class="method GET">GET</span>
      <span class="path">/api/events</span>
      <span class="auth-tag">Bearer</span>
    </div>
    <p class="desc">List active events (upcoming or ongoing, not canceled).</p>
    <p class="params">Query: <code>page</code> (default 1), <code>limit</code> (default 20, max 100).</p>
    <details>
      <summary>Example</summary>
<pre>// 200 Response
{
  "data": [
    {
      "id": 1, "title": "Sunset Rooftop Gathering",
      "type": "party", "date": "2026-05-26", "time": "19:30:00",
      "location": "Sky Bar, Sofia", "capacity": 12,
      "canceled": false, "state": "upcoming",
      "attendees": 7, "groupId": 1, "groupTitle": "City Explorers"
    }
  ],
  "page": 1, "limit": 20, "total": 4, "totalPages": 1
}</pre>
    </details>
  </div>

  <div class="endpoint">
    <div class="row">
      <span class="method GET">GET</span>
      <span class="path">/api/events/{id}</span>
      <span class="auth-tag">Bearer</span>
    </div>
    <p class="desc">Event details with state, capacity and counts. Use paged attendees/comments endpoints for lists.</p>
    <details>
      <summary>Example</summary>
<pre>// 200 Response
{
  "id": 1, "title": "Sunset Rooftop Gathering",
  "description": null, "type": "party",
  "date": "2026-05-26", "time": "19:30:00",
  "location": "Sky Bar, Sofia",
  "capacity": 12, "canceled": false,
  "state": "upcoming", "capacityState": "under",
  "attendeesCount": 7,
  "commentsCount": 2,
  "groupId": 1, "groupTitle": "City Explorers",
  "createdBy": { "id": 4, "name": "Alice" },
  "isRsvped": true, "userExtraSlots": 1, "canManage": true
}</pre>
    </details>
  </div>

  <div class="endpoint">
    <div class="row">
      <span class="method POST">POST</span>
      <span class="path">/api/events/{id}/rsvp</span>
      <span class="auth-tag">Bearer</span>
    </div>
    <p class="desc">RSVP to an event. Empty body. Fails with 409 if already RSVPed or event closed.</p>
<pre>// 200 Response
{ "ok": true, "isRsvped": true }</pre>
  </div>

  <div class="endpoint">
    <div class="row">
      <span class="method POST">POST</span>
      <span class="path">/api/events/{id}/leave</span>
      <span class="auth-tag">Bearer</span>
    </div>
    <p class="desc">Leave an event the user is RSVPed for. Empty body.</p>
<pre>// 200 Response
{ "ok": true, "isRsvped": false }</pre>
  </div>

  <div class="endpoint">
    <div class="row">
      <span class="method POST">POST</span>
      <span class="path">/api/events/{id}/slots</span>
      <span class="auth-tag">Bearer</span>
    </div>
    <p class="desc">Update extra slots (0, 1, 2 or 3) for the RSVPed user.</p>
    <details>
      <summary>Example</summary>
<pre>// Request
{ "extraSlots": 2 }

// 200 Response
{ "ok": true, "extraSlots": 2 }</pre>
    </details>
  </div>

  <h2>Attendees</h2>

  <div class="endpoint">
    <div class="row">
      <span class="method GET">GET</span>
      <span class="path">/api/events/{id}/attendees</span>
      <span class="auth-tag">Bearer</span>
    </div>
    <p class="desc">List RSVPed attendees for an event, ordered by RSVP time. Supports paging.</p>
    <p class="params">Query: <code>page</code> (default 1), <code>limit</code> (default 20, max 100).</p>
    <details>
      <summary>Example</summary>
<pre>// 200 Response
{
  "data": [
    { "userId": 4, "name": "Alice", "photoUrl": null, "extraSlots": 1, "rsvpAt": "..." }
  ],
  "page": 1, "limit": 20, "total": 1, "totalPages": 1
}</pre>
    </details>
  </div>

  <h2>Comments</h2>

  <div class="endpoint">
    <div class="row">
      <span class="method GET">GET</span>
      <span class="path">/api/events/{id}/comments</span>
      <span class="auth-tag">Bearer</span>
    </div>
    <p class="desc">List comments for an event, oldest first. Supports paging.</p>
    <p class="params">Query: <code>page</code> (default 1), <code>limit</code> (default 20, max 100).</p>
    <details>
      <summary>Example</summary>
<pre>// 200 Response
{
  "data": [
    { "id": 1, "text": "Can't wait!", "createdAt": "...", "updatedAt": "...",
      "author": { "id": 4, "name": "Alice", "photoUrl": null } }
  ],
  "page": 1, "limit": 20, "total": 1, "totalPages": 1
}</pre>
    </details>
  </div>

  <div class="endpoint">
    <div class="row">
      <span class="method POST">POST</span>
      <span class="path">/api/events/{id}/comments</span>
      <span class="auth-tag">Bearer</span>
    </div>
    <p class="desc">Post a comment on an event.</p>
    <details>
      <summary>Example</summary>
<pre>// Request
{ "text": "Looking forward to it!" }

// 201 Response
{
  "id": 12, "text": "Looking forward to it!",
  "createdAt": "...", "updatedAt": "...",
  "author": { "id": 4, "name": "Alice", "photoUrl": null }
}</pre>
    </details>
  </div>

  <h2>Errors</h2>

  <div class="endpoint">
    <p class="desc" style="margin: 0 0 10px;">
      All errors return a JSON body with a stable <code>code</code> and human-readable
      <code>message</code>:
    </p>
<pre>{ "error": { "code": "not_found", "message": "Event not found." } }</pre>
    <p class="params" style="margin-top: 14px;">
      Common codes: <code>unauthorized</code> (401), <code>forbidden</code> (403),
      <code>not_found</code> (404), <code>invalid_input</code> (400),
      <code>already_rsvped</code> / <code>not_rsvped</code> / <code>event_closed</code> /
      <code>email_taken</code> (409), <code>weak_password</code> (400),
      <code>invalid_credentials</code> (401).
    </p>
  </div>
</div>
</body>
</html>`;

export function GET() {
  return new Response(HTML, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
