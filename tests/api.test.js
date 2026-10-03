import test from 'node:test';
import assert from 'node:assert/strict';
import { app, resetData, startServer } from '../server.js';

const server = startServer(0);
const baseUrl = () => `http://127.0.0.1:${server.address().port}`;

const request = async (path, method = 'GET', body) => {
  const res = await fetch(`${baseUrl()}${path}`, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined
  });

  return {
    status: res.status,
    body: await res.json().catch(() => null)
  };
};

test.after(() => {
  server.close();
});

test('GET /api/resources returns seeded resource data', async () => {
  resetData();
  const res = await request('/api/resources');
  assert.equal(res.status, 200);
  assert.ok(Array.isArray(res.body));
  assert.ok(res.body.length > 0);
});

test('POST /api/bookings creates a pending booking', async () => {
  resetData();
  const res = await request('/api/bookings', 'POST', {
    resourceId: 'r1',
    requestedBy: 'Test User',
    date: '2026-10-15',
    startTime: '09:00',
    endTime: '10:00',
    purpose: 'Project planning'
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.status, 'pending');
  assert.equal(res.body.requestedBy, 'Test User');
});

test('POST /api/bookings rejects invalid booking times', async () => {
  resetData();
  const res = await request('/api/bookings', 'POST', {
    resourceId: 'r1',
    requestedBy: 'Test User',
    date: '2026-10-15',
    startTime: '11:00',
    endTime: '10:00',
    purpose: 'Bad time'
  });

  assert.equal(res.status, 400);
  assert.match(String(res.body.message), /after start/i);
});
