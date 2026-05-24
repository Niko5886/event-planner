// Simple integration script to exercise RSVP -> update slots -> leave flows
// Usage: TEST_TOKEN=<jwt> API_BASE=http://localhost:3000/api node scripts/integration-slots-test.js

const API_BASE = process.env.API_BASE || 'http://localhost:3000/api';
const TOKEN = process.env.TEST_TOKEN;
if (!TOKEN) {
  console.error('Missing TEST_TOKEN env var. Set TEST_TOKEN to a valid Bearer JWT.');
  process.exit(2);
}

async function req(path, opts = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${TOKEN}`,
    },
    ...opts,
  });
  const text = await res.text();
  let body = null;
  try { body = JSON.parse(text); } catch {};
  return { status: res.status, body, text };
}

async function run() {
  const eventId = 1;
  console.log('GET event');
  console.log(await req(`/events/${eventId}`));

  console.log('POST rsvp (extraSlots:0)');
  console.log(await req(`/events/${eventId}/rsvp`, { method: 'POST', body: JSON.stringify({ extraSlots: 0 }) }));

  console.log('POST update slots -> 2');
  console.log(await req(`/events/${eventId}/slots`, { method: 'POST', body: JSON.stringify({ extraSlots: 2 }) }));

  console.log('POST update slots -> 4 (exceeding old DB constraint)');
  console.log(await req(`/events/${eventId}/slots`, { method: 'POST', body: JSON.stringify({ extraSlots: 4 }) }));

  console.log('POST leave');
  console.log(await req(`/events/${eventId}/leave`, { method: 'POST' }));
}

run().catch((err) => {
  console.error('Test failed', err);
  process.exit(1);
});
