# Part 1 Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the shared foundation for the council facility booking site: design system, seed data + localStorage persistence, shared navigation with a role switcher, and the dashboard page.

**Architecture:** Plain HTML/CSS/JavaScript, no build step, no framework. One shared stylesheet (`styles.css`), one data-access module (`data.js`), one shared navigation module (`nav.js`), and per-page scripts (starting with `dashboard.js`). Every page includes the same `<div id="sitenav"></div>` placeholder that `nav.js` fills in, so nav markup is written once and reused on every future page.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript (ES2017-level, no modules/bundler), browser `localStorage`.

**Note on verification:** This project has no automated test framework (see `docs/design/design.md`, Out of Scope). Each task's "verify" step is a manual browser check instead of an automated test run.

---

## File Structure

- `styles.css` — design tokens, reset, typography, layout, nav, buttons, cards, badges, tables, forms. Built up across Tasks 1–3.
- `data.js` — `localStorage` keys, seed data, get/save accessors, `initdata()`, role get/set, `addAuditEntry()`. Built up across Tasks 4–5.
- `nav.js` — `renderNav()`, injects header/nav/role-switcher HTML into `#sitenav` on every page, wires the role-switcher buttons.
- `index.html` — dashboard page shell.
- `dashboard.js` — computes and renders the role-specific stat cards on the dashboard.

---

### Task 1: Design tokens, reset, typography, layout

**Files:**
- Create: `styles.css`

- [ ] **Step 1: Create `styles.css` with tokens, reset, typography, and layout containers**

```css
:root {
  --color-navy: #0b3d63;
  --color-steel: #0f4c75;
  --color-steel-light: #3d7ba8;
  --color-bg: #f4f6f8;
  --color-surface: #ffffff;
  --color-border: #d5dbe0;
  --color-text: #1f2937;
  --color-text-muted: #5b6673;
  --color-success: #1a7f37;
  --color-success-bg: #e6f4ea;
  --color-warning: #b45309;
  --color-warning-bg: #fdf1e0;
  --color-danger: #b91c1c;
  --color-danger-bg: #fbe9e9;
  --color-info: #0f4c75;
  --color-info-bg: #e5eef5;
  --radius: 4px;
  --spacing1: 4px;
  --spacing2: 8px;
  --spacing3: 12px;
  --spacing4: 16px;
  --spacing5: 24px;
  --spacing6: 32px;
  --font: -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font);
  background: var(--color-bg);
  color: var(--color-text);
  line-height: 1.5;
  font-size: 15px;
}

h1,
h2,
h3,
h4 {
  margin: 0 0 var(--spacing3);
  color: var(--color-navy);
  font-weight: 600;
}

h1 {
  font-size: 26px;
}

h2 {
  font-size: 20px;
}

h3 {
  font-size: 16px;
}

p {
  margin: 0 0 var(--spacing3);
}

a {
  color: var(--color-steel);
}

.subtitle {
  color: var(--color-text-muted);
  margin-bottom: var(--spacing5);
}

.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main {
  flex: 1;
}

.container {
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--spacing5) var(--spacing4);
}
```

- [ ] **Step 2: Commit**

```bash
git add styles.css
git commit -m "Add design tokens, reset, and layout styles"
```

---

### Task 2: Header/nav/role-switcher styles

**Files:**
- Modify: `styles.css` (append)

- [ ] **Step 1: Append nav and role-switcher styles to `styles.css`**

```css
.sitenav {
  background: var(--color-navy);
  color: #fff;
}

.navinner {
  max-width: 1100px;
  margin: 0 auto;
  padding: 0 var(--spacing4);
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--spacing3);
}

.navbrand {
  display: flex;
  align-items: center;
  gap: var(--spacing2);
  padding: var(--spacing3) 0;
  font-weight: 700;
  font-size: 17px;
  color: #fff;
  text-decoration: none;
}

.navlinks {
  display: flex;
  gap: var(--spacing1);
  list-style: none;
  margin: 0;
  padding: 0;
  flex-wrap: wrap;
}

.navlinks a {
  display: block;
  padding: var(--spacing3);
  color: #d7e4ef;
  text-decoration: none;
  font-size: 14px;
  border-bottom: 3px solid transparent;
}

.navlinks a:hover {
  color: #fff;
}

.navlinks a.active {
  color: #fff;
  border-bottom-color: var(--color-steel-light);
}

.roleswitch {
  display: flex;
  align-items: center;
  gap: var(--spacing2);
  padding: var(--spacing2) 0;
}

.roleswitch span {
  font-size: 12px;
  color: #b9c9d8;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.rolebuttons {
  display: flex;
  background: rgba(255, 255, 255, 0.12);
  border-radius: var(--radius);
  padding: 2px;
}

.rolebutton {
  border: none;
  background: transparent;
  color: #d7e4ef;
  padding: 6px 10px;
  font-size: 13px;
  border-radius: 3px;
  cursor: pointer;
}

.rolebutton.active {
  background: #fff;
  color: var(--color-navy);
  font-weight: 600;
}
```

- [ ] **Step 2: Commit**

```bash
git add styles.css
git commit -m "Add nav and role switcher styles"
```

---

### Task 3: Buttons, cards, badges, tables, forms

**Files:**
- Modify: `styles.css` (append)

- [ ] **Step 1: Append component styles to `styles.css`**

```css
.btn {
  display: inline-block;
  padding: 8px 14px;
  border-radius: var(--radius);
  border: 1px solid transparent;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

.btnprimary {
  background: var(--color-steel);
  color: #fff;
}

.btnprimary:hover {
  background: var(--color-navy);
}

.btnsecondary {
  background: #fff;
  color: var(--color-steel);
  border-color: var(--color-border);
}

.btnsecondary:hover {
  background: var(--color-bg);
}

.btndanger {
  background: var(--color-danger);
  color: #fff;
}

.btndanger:hover {
  background: #931515;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.cardgrid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: var(--spacing4);
  margin-bottom: var(--spacing5);
}

.card {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--spacing4);
}

.statcard .statnumber {
  font-size: 30px;
  font-weight: 700;
  color: var(--color-navy);
}

.statcard .statlabel {
  font-size: 13px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge {
  display: inline-block;
  padding: 3px 9px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
}

.badgesuccess {
  background: var(--color-success-bg);
  color: var(--color-success);
}

.badgewarning {
  background: var(--color-warning-bg);
  color: var(--color-warning);
}

.badgedanger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}

.badgeinfo {
  background: var(--color-info-bg);
  color: var(--color-info);
}

table {
  width: 100%;
  border-collapse: collapse;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  overflow: hidden;
}

th,
td {
  text-align: left;
  padding: var(--spacing3);
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
}

th {
  background: var(--color-bg);
  color: var(--color-text-muted);
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

tr:last-child td {
  border-bottom: none;
}

label {
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-bottom: var(--spacing1);
  color: var(--color-text);
}

input,
select,
textarea {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  font-family: var(--font);
  font-size: 14px;
  margin-bottom: var(--spacing3);
}

.formrow {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: var(--spacing3);
}

.emptystate {
  text-align: center;
  padding: var(--spacing6);
  color: var(--color-text-muted);
}
```

- [ ] **Step 2: Commit**

```bash
git add styles.css
git commit -m "Add button, card, badge, table, and form styles"
```

---

### Task 4: Data layer part 1 — storage helpers and seed resources

**Files:**
- Create: `data.js`

- [ ] **Step 1: Create `data.js` with storage keys, JSON helpers, and seed resources**

```javascript
const STORAGEKEYS = {
  resources: "councilresources",
  bookings: "councilbookings",
  maintenanceTasks: "councilmaintenancetasks",
  closures: "councilclosures",
  auditLog: "councilauditlog",
  role: "councilrole"
};

function readjson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    return fallback;
  }
}

function writejson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function defaultResources() {
  return [
    {
      id: "r1",
      name: "Riverside Community Hall",
      type: "facility",
      location: "12 River St",
      capacity: 150,
      description: "Large hall suitable for community events, weddings, and functions.",
      status: "available"
    },
    {
      id: "r2",
      name: "Oak Park Pavilion",
      type: "facility",
      location: "Oak Park",
      capacity: 80,
      description: "Open-sided pavilion with BBQ facilities, popular for family gatherings.",
      status: "available"
    },
    {
      id: "r3",
      name: "Meeting Room A",
      type: "room",
      location: "Council Administration Building",
      capacity: 12,
      description: "Small meeting room with whiteboard and video conferencing.",
      status: "available"
    },
    {
      id: "r4",
      name: "Meeting Room B",
      type: "room",
      location: "Council Administration Building",
      capacity: 20,
      description: "Medium meeting room, suitable for workshops.",
      status: "maintenance"
    },
    {
      id: "r5",
      name: "Portable PA System",
      type: "equipment",
      location: "Equipment Store",
      capacity: 1,
      description: "Portable speaker and microphone set for outdoor events.",
      status: "available"
    },
    {
      id: "r6",
      name: "Tennis Court 2",
      type: "facility",
      location: "Riverside Sports Complex",
      capacity: 4,
      description: "Outdoor hard-court tennis court, lights available after dark.",
      status: "available"
    }
  ];
}

function getResources() {
  return readjson(STORAGEKEYS.resources, []);
}

function saveResources(list) {
  writejson(STORAGEKEYS.resources, list);
}
```

- [ ] **Step 2: Verify in browser**

Open `index.html` directly in a browser (double-click, or right-click > Open with). Open the browser dev tools console (F12) and run:

```javascript
readjson("nope", "fallback")
```

Expected: `"fallback"` is printed, confirming the script loaded without syntax errors. (The page itself will still be blank — that's expected until later tasks.)

- [ ] **Step 3: Commit**

```bash
git add data.js
git commit -m "Add storage helpers and seed resource data"
```

---

### Task 5: Data layer part 2 — bookings, maintenance, closures, audit log, role, init

**Files:**
- Modify: `data.js` (append)

- [ ] **Step 1: Append remaining seed data, accessors, role helpers, and `initdata()` to `data.js`**

```javascript
function defaultBookings() {
  return [
    {
      id: "b1",
      resourceId: "r1",
      requestedBy: "Jamie Lee",
      date: "2026-10-05",
      startTime: "10:00",
      endTime: "14:00",
      purpose: "Community fundraiser",
      status: "approved",
      createdAt: "2026-09-20T09:15:00"
    },
    {
      id: "b2",
      resourceId: "r3",
      requestedBy: "Priya Nair",
      date: "2026-10-03",
      startTime: "09:00",
      endTime: "10:00",
      purpose: "Neighbourhood watch meeting",
      status: "pending",
      createdAt: "2026-09-28T13:40:00"
    },
    {
      id: "b3",
      resourceId: "r2",
      requestedBy: "Sam Ostrowski",
      date: "2026-10-10",
      startTime: "12:00",
      endTime: "16:00",
      purpose: "Family birthday",
      status: "pending",
      createdAt: "2026-09-29T11:05:00"
    },
    {
      id: "b4",
      resourceId: "r6",
      requestedBy: "Alex Chen",
      date: "2026-10-02",
      startTime: "17:00",
      endTime: "18:00",
      purpose: "Casual match",
      status: "cancelled",
      createdAt: "2026-09-18T08:00:00"
    }
  ];
}

function defaultMaintenanceTasks() {
  return [
    {
      id: "m1",
      resourceId: "r4",
      reportedBy: "Council Staff",
      description: "Air conditioning unit not cooling, room too warm for use.",
      priority: "high",
      status: "assigned",
      assignedTo: "Dave Whitfield",
      createdAt: "2026-09-25T14:00:00"
    },
    {
      id: "m2",
      resourceId: "r5",
      reportedBy: "Jamie Lee",
      description: "One microphone has a loose connector, crackles intermittently.",
      priority: "medium",
      status: "reported",
      assignedTo: null,
      createdAt: "2026-09-27T10:20:00"
    }
  ];
}

function defaultClosures() {
  return [
    {
      id: "c1",
      resourceId: "r4",
      startDate: "2026-09-24",
      endDate: "2026-10-08",
      reason: "Air conditioning repair",
      affectedBookingIds: [],
      createdAt: "2026-09-25T14:05:00"
    }
  ];
}

function defaultAuditLog() {
  return [
    {
      id: "a1",
      timestamp: "2026-09-20T09:15:00",
      actor: "Council Staff",
      action: "booking_approved",
      details: "Approved booking b1 for Riverside Community Hall"
    },
    {
      id: "a2",
      timestamp: "2026-09-25T14:05:00",
      actor: "Council Staff",
      action: "closure_created",
      details: "Scheduled closure c1 for Meeting Room B (AC repair)"
    },
    {
      id: "a3",
      timestamp: "2026-09-25T14:00:00",
      actor: "Council Staff",
      action: "maintenance_assigned",
      details: "Assigned task m1 to Dave Whitfield"
    }
  ];
}

function getBookings() {
  return readjson(STORAGEKEYS.bookings, []);
}

function saveBookings(list) {
  writejson(STORAGEKEYS.bookings, list);
}

function getMaintenanceTasks() {
  return readjson(STORAGEKEYS.maintenanceTasks, []);
}

function saveMaintenanceTasks(list) {
  writejson(STORAGEKEYS.maintenanceTasks, list);
}

function getClosures() {
  return readjson(STORAGEKEYS.closures, []);
}

function saveClosures(list) {
  writejson(STORAGEKEYS.closures, list);
}

function getAuditLog() {
  return readjson(STORAGEKEYS.auditLog, []);
}

function addAuditEntry(actor, action, details) {
  const log = getAuditLog();
  log.unshift({
    id: "a" + Date.now(),
    timestamp: new Date().toISOString(),
    actor: actor,
    action: action,
    details: details
  });
  writejson(STORAGEKEYS.auditLog, log);
}

function getRole() {
  return localStorage.getItem(STORAGEKEYS.role) || "community";
}

function setRole(role) {
  localStorage.setItem(STORAGEKEYS.role, role);
}

function initdata() {
  if (!localStorage.getItem(STORAGEKEYS.resources)) {
    writejson(STORAGEKEYS.resources, defaultResources());
  }
  if (!localStorage.getItem(STORAGEKEYS.bookings)) {
    writejson(STORAGEKEYS.bookings, defaultBookings());
  }
  if (!localStorage.getItem(STORAGEKEYS.maintenanceTasks)) {
    writejson(STORAGEKEYS.maintenanceTasks, defaultMaintenanceTasks());
  }
  if (!localStorage.getItem(STORAGEKEYS.closures)) {
    writejson(STORAGEKEYS.closures, defaultClosures());
  }
  if (!localStorage.getItem(STORAGEKEYS.auditLog)) {
    writejson(STORAGEKEYS.auditLog, defaultAuditLog());
  }
  if (!localStorage.getItem(STORAGEKEYS.role)) {
    localStorage.setItem(STORAGEKEYS.role, "community");
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add data.js
git commit -m "Add bookings, maintenance, closures, audit log, and role data helpers"
```

---

### Task 6: Shared navigation component

**Files:**
- Create: `nav.js`

- [ ] **Step 1: Create `nav.js` with `renderNav()` and role-switcher wiring**

```javascript
function pagename() {
  const path = window.location.pathname;
  const file = path.substring(path.lastIndexOf("/") + 1);
  return file || "index.html";
}

function renderNav() {
  const role = getRole();
  const current = pagename();

  const links = [
    { href: "index.html", label: "Dashboard", roles: ["community", "staff"] },
    { href: "facilities.html", label: "Find a Facility", roles: ["community", "staff"] },
    { href: "bookings.html", label: role === "staff" ? "Approvals" : "My Bookings", roles: ["community", "staff"] },
    { href: "maintenance.html", label: role === "staff" ? "Maintenance" : "Report an Issue", roles: ["community", "staff"] },
    { href: "closures.html", label: "Closures", roles: ["staff"] },
    { href: "reports.html", label: "Reports", roles: ["staff"] }
  ];

  const linkshtml = links
    .filter(function (link) {
      return link.roles.indexOf(role) !== -1;
    })
    .map(function (link) {
      const activeclass = link.href === current ? "active" : "";
      return '<li><a class="' + activeclass + '" href="' + link.href + '">' + link.label + "</a></li>";
    })
    .join("");

  const html =
    '<div class="navinner">' +
    '<a class="navbrand" href="index.html">Riverbend Council &middot; Facilities</a>' +
    '<ul class="navlinks">' +
    linkshtml +
    "</ul>" +
    '<div class="roleswitch">' +
    "<span>Viewing as</span>" +
    '<div class="rolebuttons">' +
    '<button type="button" class="rolebutton ' +
    (role === "community" ? "active" : "") +
    '" data-role="community">Community Member</button>' +
    '<button type="button" class="rolebutton ' +
    (role === "staff" ? "active" : "") +
    '" data-role="staff">Council Staff</button>' +
    "</div>" +
    "</div>" +
    "</div>";

  const nav = document.getElementById("sitenav");
  nav.className = "sitenav";
  nav.innerHTML = html;

  const buttons = nav.querySelectorAll(".rolebutton");
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      setRole(button.getAttribute("data-role"));
      window.location.reload();
    });
  });
}

document.addEventListener("DOMContentLoaded", function () {
  initdata();
  renderNav();
});
```

- [ ] **Step 2: Commit**

```bash
git add nav.js
git commit -m "Add shared navigation with role switcher"
```

---

### Task 7: Dashboard page shell

**Files:**
- Create: `index.html`

- [ ] **Step 1: Create `index.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Dashboard - Riverbend Council Facilities</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="page">
      <div id="sitenav"></div>
      <main class="main">
        <div class="container">
          <h1>Dashboard</h1>
          <p id="dashboardintro" class="subtitle"></p>
          <div id="statgrid" class="cardgrid"></div>
        </div>
      </main>
    </div>
    <script src="data.js"></script>
    <script src="nav.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify in browser**

Open `index.html` in a browser. Expected:
- A navy header bar reading "Riverbend Council · Facilities" with a "Viewing as" role switcher on the right, defaulted to "Community Member" highlighted.
- Nav links: Dashboard, Find a Facility, My Bookings, Report an Issue (no Closures/Reports link, since those are staff-only).
- Click "Council Staff" in the switcher — page reloads, switcher now shows Council Staff highlighted, and the nav links change to include Approvals, Maintenance, Closures, Reports.
- The "Dashboard" link has a visible active underline.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Add dashboard page shell with shared nav"
```

---

### Task 8: Dashboard stats logic

**Files:**
- Create: `dashboard.js`
- Modify: `index.html:23` (add `<script src="dashboard.js"></script>` after the `nav.js` script tag)

- [ ] **Step 1: Create `dashboard.js`**

```javascript
function todaystring() {
  const d = new Date();
  return d.toISOString().substring(0, 10);
}

function renderdashboard() {
  const role = getRole();
  const intro = document.getElementById("dashboardintro");
  const grid = document.getElementById("statgrid");

  const bookings = getBookings();
  const resources = getResources();
  const tasks = getMaintenanceTasks();
  const closures = getClosures();

  let stats = [];

  if (role === "staff") {
    intro.textContent = "Overview of council facilities, bookings, and maintenance.";

    const pending = bookings.filter(function (b) {
      return b.status === "pending";
    }).length;
    const activetasks = tasks.filter(function (t) {
      return t.status !== "resolved";
    }).length;
    const activeclosures = closures.filter(function (c) {
      return c.endDate >= todaystring();
    }).length;
    const approved = bookings.filter(function (b) {
      return b.status === "approved";
    }).length;

    stats = [
      { number: pending, label: "Pending approvals" },
      { number: activetasks, label: "Open maintenance tasks" },
      { number: activeclosures, label: "Active closures" },
      { number: approved, label: "Approved bookings" }
    ];
  } else {
    intro.textContent = "Find and book council facilities, rooms, and equipment.";

    const mybookings = bookings.filter(function (b) {
      return b.status === "approved" || b.status === "pending";
    }).length;
    const available = resources.filter(function (r) {
      return r.status === "available";
    }).length;

    stats = [
      { number: mybookings, label: "Your active bookings" },
      { number: available, label: "Facilities available" },
      { number: resources.length, label: "Total resources listed" }
    ];
  }

  grid.innerHTML = stats
    .map(function (stat) {
      return (
        '<div class="card statcard"><div class="statnumber">' +
        stat.number +
        '</div><div class="statlabel">' +
        stat.label +
        "</div></div>"
      );
    })
    .join("");
}

document.addEventListener("DOMContentLoaded", renderdashboard);
```

- [ ] **Step 2: Add the script tag to `index.html`**

In `index.html`, change:

```html
    <script src="data.js"></script>
    <script src="nav.js"></script>
  </body>
```

to:

```html
    <script src="data.js"></script>
    <script src="nav.js"></script>
    <script src="dashboard.js"></script>
  </body>
```

- [ ] **Step 3: Verify in browser**

Reload `index.html`. As Community Member, expect three stat cards: "Your active bookings" = 3 (b1 approved, b2 pending, b3 pending — all count since there's no login/per-user filtering; that's expected for this frontend-only demo), "Facilities available" = 5, "Total resources listed" = 6.

Switch to Council Staff via the role switcher. Expect four stat cards: "Pending approvals" = 2, "Open maintenance tasks" = 2, "Active closures" = 1, "Approved bookings" = 1.

Reload the page again (F5) and confirm the role and stats are unchanged — proving `localStorage` persistence works.

- [ ] **Step 4: Commit**

```bash
git add dashboard.js index.html
git commit -m "Add dashboard stat cards for both roles"
```

---

### Task 9: Push Part 1 to GitHub

**Files:** none (git only)

- [ ] **Step 1: Push all Part 1 commits**

```bash
git push origin master
```

- [ ] **Step 2: Verify on GitHub**

Open the repo in a browser and confirm `styles.css`, `data.js`, `nav.js`, `index.html`, and `dashboard.js` are present at the repo root, with no `.claude`, `.superpowers`, or hyphenated/underscored filenames anywhere in the tree.
