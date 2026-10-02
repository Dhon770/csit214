# Part 6 Reports Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `reports.html` — two simple utilisation bar charts (bookings per resource, maintenance tasks per resource) and a searchable audit history table sourced from `auditLog`.

**Architecture:** One new, staff-only page (`reports.html`, same no-role-toggle pattern as `closures.html` since `nav.js` already restricts this link to staff). Charts are plain CSS — a flexbox row per label with a width-percentage `<div>` as the bar — no SVG, no charting library, nothing elaborate; this is a prototype, not a production dashboard. The audit table reads `getAuditLog()` (already returns newest-first, since `addAuditEntry()` unshifts) and supports one plain text search box that filters across actor/action/details.

**Tech Stack:** Plain HTML/CSS/JavaScript, no framework, no build step, browser `localStorage` via the existing `data.js`.

**Note on verification:** No automated test framework exists for this project. Each task's "verify" step is a manual/static check instead of an automated test run.

---

## File Structure

- `styles.css` — append a small set of bar-chart styles (`.barchart`, `.barrow`, `.barlabel`, `.bartrack`, `.barfill`, `.barvalue`). Built in Task 1.
- `reports.html` — new page shell: two chart containers, a search input, an audit history table. Built in Task 2.
- `reports.js` — new page script. Built across Tasks 3–4: generic counting/bar-chart helpers + the two chart renders first, then the audit table render + search wiring + init.

---

### Task 1: Report chart styles

**Files:**
- Modify: `styles.css` (append)

- [ ] **Step 1: Append bar chart styles to `styles.css`**

```css
.barchart {
  display: flex;
  flex-direction: column;
  gap: var(--spacing2);
  margin-bottom: var(--spacing5);
}

.barrow {
  display: flex;
  align-items: center;
  gap: var(--spacing3);
}

.barlabel {
  width: 160px;
  font-size: 13px;
  color: var(--color-text);
  flex-shrink: 0;
}

.bartrack {
  flex: 1;
  background: var(--color-bg);
  border-radius: var(--radius);
  overflow: hidden;
  height: 20px;
}

.barfill {
  background: var(--color-steel);
  height: 100%;
  border-radius: var(--radius);
}

.barvalue {
  width: 30px;
  text-align: right;
  font-size: 13px;
  color: var(--color-text-muted);
  flex-shrink: 0;
}
```

- [ ] **Step 2: Commit**

```bash
git add styles.css
git commit -m "Add report bar chart styles"
```

---

### Task 2: Reports page shell

**Files:**
- Create: `reports.html`

- [ ] **Step 1: Create `reports.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Reports - Riverbend Council Facilities</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="page">
      <div id="sitenav"></div>
      <main class="main">
        <div class="container">
          <h1>Reports</h1>
          <p class="subtitle">Facility utilisation and audit history.</p>

          <h2>Bookings per Resource</h2>
          <div id="bookingschart" class="barchart"></div>

          <h2>Maintenance Tasks per Resource</h2>
          <div id="maintenancechart" class="barchart"></div>

          <h2>Audit History</h2>
          <div class="formrow">
            <div>
              <label for="auditsearch">Search audit log</label>
              <input type="text" id="auditsearch" placeholder="Search by actor, action, or details" />
            </div>
          </div>
          <div class="tablewrap">
            <table id="audittable">
              <thead>
                <tr>
                  <th>Timestamp</th>
                  <th>Actor</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody id="auditbody"></tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
    <script src="data.js"></script>
    <script src="nav.js"></script>
    <script src="reports.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify**

Re-read the file and confirm: script order is `data.js`, `nav.js`, `reports.js`; every element ID referenced by upcoming JS tasks exists exactly as spelled (`bookingschart`, `maintenancechart`, `auditsearch`, `audittable`, `auditbody`); `audittable` has 4 header columns.

- [ ] **Step 3: Commit**

```bash
git add reports.html
git commit -m "Add reports page shell with chart and audit table containers"
```

---

### Task 3: Chart helpers and rendering

**Files:**
- Create: `reports.js`

- [ ] **Step 1: Create `reports.js` with counting helpers and the two chart renders**

```javascript
function resourcename(resourceid) {
  const resource = getResources().filter(function (r) {
    return r.id === resourceid;
  })[0];
  return resource ? resource.name : "Unknown resource";
}

function countby(items, keyfn) {
  const counts = {};
  items.forEach(function (item) {
    const key = keyfn(item);
    counts[key] = (counts[key] || 0) + 1;
  });
  return counts;
}

function renderbarchart(containerid, counts) {
  const container = document.getElementById(containerid);
  const entries = Object.keys(counts).map(function (key) {
    return { label: key, value: counts[key] };
  });

  if (entries.length === 0) {
    container.innerHTML = '<div class="emptystate">No data yet.</div>';
    return;
  }

  const maxvalue = Math.max.apply(
    null,
    entries.map(function (e) {
      return e.value;
    })
  );

  container.innerHTML = entries
    .map(function (e) {
      const percent = maxvalue === 0 ? 0 : Math.round((e.value / maxvalue) * 100);
      return (
        '<div class="barrow">' +
        '<div class="barlabel">' +
        e.label +
        "</div>" +
        '<div class="bartrack"><div class="barfill" style="width: ' +
        percent +
        '%"></div></div>' +
        '<div class="barvalue">' +
        e.value +
        "</div>" +
        "</div>"
      );
    })
    .join("");
}

function renderbookingschart() {
  const bookings = getBookings().filter(function (b) {
    return b.status === "approved" || b.status === "pending";
  });
  const counts = countby(bookings, function (b) {
    return resourcename(b.resourceId);
  });
  renderbarchart("bookingschart", counts);
}

function rendermaintenancechart() {
  const tasks = getMaintenanceTasks();
  const counts = countby(tasks, function (t) {
    return resourcename(t.resourceId);
  });
  renderbarchart("maintenancechart", counts);
}
```

- [ ] **Step 2: Verify**

Run: `node --check reports.js`
Expected: no output, exit code 0.

Trace through with the Part 1 seed data: bookings b1 (approved, r1), b2 (pending, r3), b3 (pending, r2) count toward the bookings chart (b4 is cancelled, excluded) — expect three bars, one each for "Riverside Community Hall", "Meeting Room A", "Oak Park Pavilion", each at 100% width (all tied at 1). Maintenance tasks m1 (r4) and m2 (r5) both count toward the maintenance chart — expect two bars, "Meeting Room B" and "Portable PA System", both at 100% width.

- [ ] **Step 3: Commit**

```bash
git add reports.js
git commit -m "Add utilisation chart helpers and rendering"
```

---

### Task 4: Audit table, search, and page init

**Files:**
- Modify: `reports.js` (append)

- [ ] **Step 1: Append audit table rendering, search wiring, and init to `reports.js`**

```javascript
function renderaudittable() {
  const body = document.getElementById("auditbody");
  const search = document.getElementById("auditsearch").value.trim().toLowerCase();

  const entries = getAuditLog().filter(function (entry) {
    if (search === "") {
      return true;
    }
    const haystack = (entry.actor + " " + entry.action + " " + entry.details).toLowerCase();
    return haystack.indexOf(search) !== -1;
  });

  if (entries.length === 0) {
    body.innerHTML = '<tr><td colspan="4" class="emptystate">No audit entries match your search.</td></tr>';
    return;
  }

  body.innerHTML = entries
    .map(function (entry) {
      return (
        "<tr>" +
        "<td>" +
        entry.timestamp +
        "</td>" +
        "<td>" +
        entry.actor +
        "</td>" +
        "<td>" +
        entry.action +
        "</td>" +
        "<td>" +
        entry.details +
        "</td>" +
        "</tr>"
      );
    })
    .join("");
}

function initreportspage() {
  renderbookingschart();
  rendermaintenancechart();
  renderaudittable();

  document.getElementById("auditsearch").addEventListener("input", function () {
    renderaudittable();
  });
}

document.addEventListener("DOMContentLoaded", initreportspage);
```

- [ ] **Step 2: Syntax check**

Run: `node --check reports.js`
Expected: no output, exit code 0.

Confirm the full file (Tasks 3 + 4 combined) has no forward references left undefined.

- [ ] **Step 3: Manual static verification (no browser available)**

Confirm every element ID this code references exists in `reports.html` (`bookingschart`, `maintenancechart`, `auditsearch`, `auditbody`). Confirm every CSS class referenced exists in `styles.css` (`barchart`, `barrow`, `barlabel`, `bartrack`, `barfill`, `barvalue`, `emptystate`). `getAuditLog()` is already defined in `data.js` (Part 1) and returns entries newest-first (since `addAuditEntry()` unshifts), so no additional sorting is needed here — confirm the code doesn't re-sort or reverse the array. Note that full interactive verification (typing in the search box, seeing the table filter) needs a human with a real browser.

- [ ] **Step 4: Commit**

```bash
git add reports.js
git commit -m "Add audit history table with search"
```

---

### Task 5: Push Part 6 to GitHub

**Files:** none (git only)

- [ ] **Step 1: Push all Part 6 commits**

```bash
git push origin master
```

- [ ] **Step 2: Verify on GitHub**

Confirm `reports.html` and `reports.js` are present at the repo root alongside the Part 1–5 files, and `nav.js`'s previously-dead "Reports" link (staff role) now points at a real page. Confirm no `.claude`, `.superpowers`, or hyphenated/underscored filenames appear anywhere in the tree, and no commit messages carry a Claude/AI attribution trailer.
