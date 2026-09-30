# Council Facility & Maintenance Booking System — Frontend Design

Date: 2026-09-30
Status: Approved

## Purpose

A frontend-only IT system for a local council to manage facilities, rooms, and
equipment: searching and checking availability, requesting and approving
bookings, detecting conflicts, cancelling bookings, reporting and assigning
maintenance, scheduling temporary closures and managing the bookings affected
by them, and producing utilisation reports and audit history.

This is a university assignment deliverable (CSIT214 IT Project Management).
Scope is explicitly **frontend only** — no real backend, server, or
authentication.

## Stack

- Plain HTML, CSS, JavaScript. No framework, no build step.
- Multi-page site: one `.html` file per module, sharing a common header/nav
  and shared `styles.css` / JS modules.
- Data persistence via `localStorage`, seeded with sample data on first load.
  Actions (bookings, approvals, cancellations, maintenance updates, closures)
  persist across page reloads so the app can be meaningfully demoed.
- No external JS libraries/CDN dependencies. Charts for utilisation reports
  are hand-built with CSS/SVG.

## Roles

No real authentication. A role switcher in the shared header toggles between:

- **Community Member** — search facilities, check availability, submit
  booking requests, view/cancel their own bookings, report maintenance
  issues.
- **Council Staff** — everything a Community Member can do, plus: approve/
  reject booking requests, see conflict flags, assign and update maintenance
  tasks, schedule temporary closures and manage affected bookings, view
  utilisation reports and audit history.

The current role is stored in `localStorage` and read by shared nav code to
show/hide role-specific links and actions.

## Data Model (seed data + localStorage shape)

- **resources** — unified list for facilities, rooms, and equipment.
  Fields: `id`, `name`, `type` (`facility` | `room` | `equipment`),
  `location`, `capacity`, `description`, `status`
  (`available` | `closed` | `maintenance`).
- **bookings** — `id`, `resourceId`, `requestedBy`, `date`, `startTime`,
  `endTime`, `purpose`, `status`
  (`pending` | `approved` | `rejected` | `cancelled`), `createdAt`.
- **maintenanceTasks** — `id`, `resourceId`, `reportedBy`, `description`,
  `priority`, `status` (`reported` | `assigned` | `in_progress` | `resolved`),
  `assignedTo`, `createdAt`.
- **closures** — `id`, `resourceId`, `startDate`, `endDate`, `reason`,
  `affectedBookingIds`, `createdAt`.
- **auditLog** — `id`, `timestamp`, `actor` (role/name), `action`
  (e.g. `booking_approved`, `closure_created`), `details`.

Each module reads/writes its own slice of `localStorage` via small helper
functions (get/set/seed-if-empty), kept in a shared `data.js`.

## Visual Style

"Civic Professional": navy / steel-blue palette, clean squared cards and
tables, official but legible council look. Consistent header/nav across all
pages using shared CSS.

## Pages & Feature Mapping

1. **`index.html`** — Landing/dashboard. Shared layout, nav, role switcher,
   seed-data bootstrap, quick summary stats (open bookings, pending
   approvals, active maintenance tasks — staff view only).
2. **`facilities.html`** — Facility/room/equipment directory: search,
   filter by type/location/capacity, availability calendar per resource
   (availability checking).
3. **`bookings.html`** — Booking request form (from a resource), conflict
   detection against existing approved/pending bookings for the same
   resource/time, staff approval queue (approve/reject with conflict
   warnings shown), community "My Bookings" list with cancellation.
4. **`maintenance.html`** — Maintenance issue reporting form (any role),
   staff task queue with assignment (assign to a staff member) and status
   updates.
5. **`closures.html`** — Staff schedules a temporary closure for a resource
   (date range + reason); system lists bookings that fall within the
   closure window (affected-booking management) with actions to cancel or
   flag them for rescheduling.
6. **`reports.html`** — Utilisation reports (bookings per resource,
   occupancy over time, maintenance frequency) as simple CSS/SVG bar
   charts, plus a searchable/filterable audit history table sourced from
   `auditLog`.

Every state-changing action (booking created/approved/rejected/cancelled,
maintenance reported/assigned/resolved, closure created) writes an entry to
`auditLog`, which `reports.html` displays.

## Build & Push Order

Each part is a separate, working commit pushed to `origin/master` in this
order:

1. Foundation — shared layout/nav/CSS, role switcher, `data.js` with seed
   data, `index.html` dashboard.
2. `facilities.html` — search, filtering, availability calendar.
3. `bookings.html` — request flow, conflict detection, approvals,
   cancellations.
4. `maintenance.html` — reporting, task assignment, status tracking.
5. `closures.html` — closure scheduling, affected-booking management.
6. `reports.html` — utilisation charts, audit history.
7. Polish pass — responsive check, empty/error states, README.

## Out of Scope

- Real authentication/authorization.
- A real backend/API/database — everything is client-side `localStorage`.
- Payment or fee handling for bookings.
- Email/SMS notifications (any "notify" actions are UI-only, e.g. a status
  badge or toast, not real messages).
- Automated tests (frontend-only demo project).
