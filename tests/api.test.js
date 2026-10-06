import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
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

test('POST /api/closures creates a scheduled closure', async () => {
  resetData();
  const res = await request('/api/closures', 'POST', {
    resourceId: 'r4',
    startDate: '2026-10-12',
    endDate: '2026-10-15',
    reason: 'Air filter maintenance',
    affectedBookingIds: []
  });

  assert.equal(res.status, 201);
  assert.equal(res.body.resourceId, 'r4');
  assert.equal(res.body.reason, 'Air filter maintenance');
});

test('reopenresource removes the active closure and restores the resource to available', () => {
  const state = {
    resources: [{
      id: 'r4',
      name: 'Meeting Room B',
      type: 'room',
      location: 'Council Administration Building',
      capacity: 20,
      description: 'Medium meeting room, suitable for workshops.',
      status: 'closed'
    }],
    closures: [{
      id: 'c1',
      resourceId: 'r4',
      startDate: '2026-10-01',
      endDate: '2026-10-10',
      reason: 'Air conditioning repair',
      affectedBookingIds: [],
      createdAt: '2026-09-25T14:05:00'
    }],
    maintenanceTasks: []
  };

  const context = {
    document: {
      getElementById: () => ({
        innerHTML: '',
        addEventListener: () => {},
        querySelectorAll: () => [],
        querySelector: () => null,
        appendChild: () => {},
        reset: () => {}
      }),
      createElement: () => ({ value: '', textContent: '', disabled: false, selected: false, appendChild: () => {} }),
      addEventListener: () => {}
    },
    window: { location: { pathname: '/closures.html', search: '' } },
    localStorage: {
      getItem: () => null,
      setItem: () => {}
    },
    getResources: () => state.resources,
    saveResources: (resources) => {
      state.resources = resources;
    },
    getClosures: () => state.closures,
    saveClosures: (closures) => {
      state.closures = closures;
    },
    getBookings: () => [],
    saveBookings: () => {},
    getMaintenanceTasks: () => state.maintenanceTasks,
    saveMaintenanceTasks: (tasks) => {
      state.maintenanceTasks = tasks;
    },
    getRole: () => 'staff',
    addAuditEntry: () => {}
  };

  vm.runInNewContext(fs.readFileSync('./closures.js', 'utf8'), context);
  context.reopenresource('r4');

  assert.equal(context.getClosures().length, 0);
  assert.equal(context.getResources()[0].status, 'available');
});

test('future closures do not override active maintenance before they start', () => {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 3);

  const fmt = (d) => {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return d.getFullYear() + '-' + mm + '-' + dd;
  };

  const state = {
    resources: [{
      id: 'r7',
      name: 'Portable PA System',
      type: 'equipment',
      location: 'Community Hall',
      capacity: 1,
      description: 'Portable audio system.',
      status: 'available'
    }],
    closures: [{
      resourceId: 'r7',
      startDate: fmt(start),
      endDate: fmt(end),
      reason: 'Planned checkup'
    }],
    maintenanceTasks: [{
      id: 'm7',
      resourceId: 'r7',
      status: 'in_progress'
    }]
  };

  const context = {
    getResources: () => state.resources,
    getClosures: () => state.closures,
    getMaintenanceTasks: () => state.maintenanceTasks,
    saveResources: (resources) => {
      state.resources = resources;
    },
    saveMaintenanceTasks: (tasks) => {
      state.maintenanceTasks = tasks;
    },
    saveClosures: (closures) => {
      state.closures = closures;
    },
    addAuditEntry: () => {},
    document: {
      addEventListener: () => {},
      getElementById: () => ({
        addEventListener: () => {},
        reset: () => {},
        hidden: false,
        innerHTML: ''
      }),
      createElement: () => ({ value: '', textContent: '', disabled: false, selected: false, appendChild: () => {} })
    }
  };

  vm.runInNewContext(fs.readFileSync('./maintenance.js', 'utf8'), context);
  context.updateResourceMaintenanceStatus('r7');

  assert.equal(context.getResources()[0].status, 'maintenance');
});
