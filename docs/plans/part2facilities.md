# Part 2 Facilities Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `facilities.html` — a searchable, filterable directory of council facilities, rooms, and equipment, with an availability calendar and upcoming-bookings list per resource.

**Architecture:** One new page (`facilities.html`) with a master-detail layout: a filter bar above, a resource list on the left, and a detail panel on the right showing the selected resource's description, status, a current-month availability calendar (booked days highlighted from existing bookings), and a plain-text list of upcoming bookings. New CSS is appended to the existing shared `styles.css`. `facilities.js` reads `getResources()`/`getBookings()` from `data.js` (already built in Part 1) — no data model changes.

**Tech Stack:** Plain HTML/CSS/JavaScript, no framework, no build step, browser `localStorage` via the existing `data.js`.

**Note on verification:** No automated test framework exists for this project. Each task's "verify" step is a manual/static check instead of an automated test run.

---

## File Structure

- `styles.css` — append filter bar, resource list/card, detail panel, and calendar grid styles. Built in Task 1.
- `facilities.html` — new page shell: filter controls, resource list container, detail panel container. Built in Task 2.
- `facilities.js` — new page script. Built across Tasks 3–4: filtering/list-rendering first, then detail-panel/calendar rendering plus the page's init wiring.

---

### Task 1: Facilities page styles

**Files:**
- Modify: `styles.css` (append)

- [ ] **Step 1: Append filter bar, resource list, detail panel, and calendar styles to `styles.css`**

```css
.filterbar {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing3);
  align-items: flex-end;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--spacing4);
  margin-bottom: var(--spacing5);
}

.filterfield {
  flex: 1;
  min-width: 160px;
}

.filterfield label {
  margin-bottom: var(--spacing1);
}

.filterfield input,
.filterfield select {
  margin-bottom: 0;
}

.resourcelayout {
  display: grid;
  grid-template-columns: minmax(260px, 380px) 1fr;
  gap: var(--spacing4);
  align-items: start;
}

@media (max-width: 720px) {
  .resourcelayout {
    grid-template-columns: 1fr;
  }
}

.resourcelist {
  display: flex;
  flex-direction: column;
  gap: var(--spacing3);
}

.resourceitem {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--spacing3);
  cursor: pointer;
  text-align: left;
  width: 100%;
  font-family: var(--font);
}

.resourceitem:hover {
  border-color: var(--color-steel-light);
}

.resourceitem.selected {
  border-color: var(--color-steel);
  box-shadow: 0 0 0 1px var(--color-steel);
}

.resourcename {
  font-weight: 600;
  color: var(--color-navy);
  margin-bottom: var(--spacing1);
}

.resourcemeta {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: var(--spacing2);
}

.detailpanel {
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: var(--spacing4);
  min-height: 200px;
}

.calendarheader {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing3);
}

.calendargrid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 4px;
  margin-bottom: var(--spacing4);
}

.calendarweekday {
  text-align: center;
  font-size: 11px;
  color: var(--color-text-muted);
  text-transform: uppercase;
  padding-bottom: var(--spacing1);
}

.calendarday {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius);
  font-size: 13px;
  background: var(--color-bg);
  color: var(--color-text);
}

.calendarday.empty {
  background: transparent;
}

.calendarday.booked {
  background: var(--color-info-bg);
  color: var(--color-info);
  font-weight: 600;
}

.calendarday.today {
  border: 2px solid var(--color-steel);
}

.bookinglist {
  list-style: none;
  margin: 0;
  padding: 0;
}

.bookinglistitem {
  padding: var(--spacing2) 0;
  border-bottom: 1px solid var(--color-border);
  font-size: 14px;
}

.bookinglistitem:last-child {
  border-bottom: none;
}
```

- [ ] **Step 2: Commit**

```bash
git add styles.css
git commit -m "Add facilities page styles"
```

---

### Task 2: Facilities page shell

**Files:**
- Create: `facilities.html`

- [ ] **Step 1: Create `facilities.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Find a Facility - Riverbend Council Facilities</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="page">
      <div id="sitenav"></div>
      <main class="main">
        <div class="container">
          <h1>Find a Facility</h1>
          <p class="subtitle">Search council facilities, rooms, and equipment, and check availability.</p>
          <div class="filterbar">
            <div class="filterfield">
              <label for="searchinput">Search</label>
              <input type="text" id="searchinput" placeholder="Search by name" />
            </div>
            <div class="filterfield">
              <label for="typeinput">Type</label>
              <select id="typeinput">
                <option value="">All types</option>
                <option value="facility">Facility</option>
                <option value="room">Room</option>
                <option value="equipment">Equipment</option>
              </select>
            </div>
            <div class="filterfield">
              <label for="locationinput">Location</label>
              <select id="locationinput">
                <option value="">All locations</option>
              </select>
            </div>
            <div class="filterfield">
              <label for="capacityinput">Minimum capacity</label>
              <input type="number" id="capacityinput" min="0" placeholder="Any" />
            </div>
          </div>
          <div class="resourcelayout">
            <div id="resourcelist" class="resourcelist"></div>
            <div id="detailpanel" class="detailpanel"></div>
          </div>
        </div>
      </main>
    </div>
    <script src="data.js"></script>
    <script src="nav.js"></script>
    <script src="facilities.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify**

Re-read the file and confirm: script order is `data.js`, `nav.js`, `facilities.js`; the `<div id="sitenav"></div>` placeholder exists; the `locationinput` select has only the "All locations" default option (the rest are populated by `facilities.js` at runtime, not this task); all filter input IDs match exactly (`searchinput`, `typeinput`, `locationinput`, `capacityinput`) since later tasks reference these exact IDs.

- [ ] **Step 3: Commit**

```bash
git add facilities.html
git commit -m "Add facilities page shell with filter bar"
```

---

### Task 3: Facilities list rendering and filtering

**Files:**
- Create: `facilities.js`

- [ ] **Step 1: Create `facilities.js` with list rendering and filter logic**

```javascript
let selectedresourceid = null;

function populatelocations() {
  const select = document.getElementById("locationinput");
  const resources = getResources();
  const locations = [];
  resources.forEach(function (r) {
    if (locations.indexOf(r.location) === -1) {
      locations.push(r.location);
    }
  });
  locations.sort();
  locations.forEach(function (loc) {
    const option = document.createElement("option");
    option.value = loc;
    option.textContent = loc;
    select.appendChild(option);
  });
}

function statusbadgeclass(status) {
  if (status === "available") {
    return "badgesuccess";
  }
  if (status === "maintenance") {
    return "badgewarning";
  }
  return "badgedanger";
}

function statuslabel(status) {
  if (status === "available") {
    return "Available";
  }
  if (status === "maintenance") {
    return "Under maintenance";
  }
  return "Closed";
}

function typelabel(type) {
  if (type === "facility") {
    return "Facility";
  }
  if (type === "room") {
    return "Room";
  }
  return "Equipment";
}

function filteredresources() {
  const search = document.getElementById("searchinput").value.trim().toLowerCase();
  const type = document.getElementById("typeinput").value;
  const location = document.getElementById("locationinput").value;
  const capacity = document.getElementById("capacityinput").value;
  const mincapacity = capacity === "" ? 0 : Number(capacity);

  return getResources().filter(function (r) {
    const matchessearch = search === "" || r.name.toLowerCase().indexOf(search) !== -1;
    const matchestype = type === "" || r.type === type;
    const matcheslocation = location === "" || r.location === location;
    const matchescapacity = r.capacity >= mincapacity;
    return matchessearch && matchestype && matcheslocation && matchescapacity;
  });
}

function renderresourcelist() {
  const list = document.getElementById("resourcelist");
  const resources = filteredresources();

  if (resources.length === 0) {
    list.innerHTML = '<div class="emptystate">No resources match your search.</div>';
    return;
  }

  list.innerHTML = resources
    .map(function (r) {
      const selectedclass = r.id === selectedresourceid ? "selected" : "";
      return (
        '<button type="button" class="resourceitem ' +
        selectedclass +
        '" data-id="' +
        r.id +
        '">' +
        '<div class="resourcename">' +
        r.name +
        "</div>" +
        '<div class="resourcemeta">' +
        typelabel(r.type) +
        " &middot; " +
        r.location +
        " &middot; Capacity " +
        r.capacity +
        "</div>" +
        '<span class="badge ' +
        statusbadgeclass(r.status) +
        '">' +
        statuslabel(r.status) +
        "</span>" +
        "</button>"
      );
    })
    .join("");

  const buttons = list.querySelectorAll(".resourceitem");
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      selectedresourceid = button.getAttribute("data-id");
      renderresourcelist();
      renderdetailpanel();
    });
  });
}
```

- [ ] **Step 2: Verify**

Run: `node --check facilities.js`
Expected: no output, exit code 0.

Note: `renderresourcelist()`'s click handler calls `renderdetailpanel()`, which is NOT defined until Task 4. That's expected — this file isn't wired up to run yet (no `DOMContentLoaded` listener calls these functions until Task 4 adds it). `node --check` only validates syntax, so the undefined-function reference won't be caught here; it's fine because Task 4 defines it before anything actually executes in the browser.

- [ ] **Step 3: Commit**

```bash
git add facilities.js
git commit -m "Add facilities list rendering and filters"
```

---

### Task 4: Detail panel, calendar, and page init

**Files:**
- Modify: `facilities.js` (append)

- [ ] **Step 1: Append detail panel, calendar rendering, and init wiring to `facilities.js`**

```javascript
function todaystring() {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + mm + "-" + dd;
}

function renderdetailpanel() {
  const panel = document.getElementById("detailpanel");

  if (!selectedresourceid) {
    panel.innerHTML = '<div class="emptystate">Select a resource to see its details and availability.</div>';
    return;
  }

  const resource = getResources().filter(function (r) {
    return r.id === selectedresourceid;
  })[0];

  if (!resource) {
    panel.innerHTML = '<div class="emptystate">Select a resource to see its details and availability.</div>';
    return;
  }

  const bookings = getBookings().filter(function (b) {
    return b.resourceId === resource.id && (b.status === "approved" || b.status === "pending");
  });

  panel.innerHTML =
    "<h2>" +
    resource.name +
    "</h2>" +
    '<p class="resourcemeta">' +
    typelabel(resource.type) +
    " &middot; " +
    resource.location +
    " &middot; Capacity " +
    resource.capacity +
    "</p>" +
    '<span class="badge ' +
    statusbadgeclass(resource.status) +
    '">' +
    statuslabel(resource.status) +
    "</span>" +
    "<p>" +
    resource.description +
    "</p>" +
    '<div id="calendarcontainer"></div>' +
    "<h3>Upcoming bookings</h3>" +
    '<ul class="bookinglist" id="bookinglist"></ul>';

  rendercalendar(bookings);
  renderbookinglist(bookings);
}

function renderbookinglist(bookings) {
  const list = document.getElementById("bookinglist");

  if (bookings.length === 0) {
    list.innerHTML = '<li class="bookinglistitem">No upcoming bookings for this resource.</li>';
    return;
  }

  const sorted = bookings.slice().sort(function (a, b) {
    return a.date.localeCompare(b.date);
  });

  list.innerHTML = sorted
    .map(function (b) {
      return (
        '<li class="bookinglistitem">' +
        b.date +
        ", " +
        b.startTime +
        "–" +
        b.endTime +
        " &mdash; " +
        b.purpose +
        "</li>"
      );
    })
    .join("");
}

function rendercalendar(bookings) {
  const container = document.getElementById("calendarcontainer");
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();

  const bookeddates = {};
  bookings.forEach(function (b) {
    bookeddates[b.date] = true;
  });

  const firstday = new Date(year, month, 1);
  const daysinmonth = new Date(year, month + 1, 0).getDate();
  const startweekday = firstday.getDay();
  const monthnames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const weekdaynames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  let cellshtml = weekdaynames
    .map(function (name) {
      return '<div class="calendarweekday">' + name + "</div>";
    })
    .join("");

  for (let i = 0; i < startweekday; i++) {
    cellshtml += '<div class="calendarday empty"></div>';
  }

  for (let day = 1; day <= daysinmonth; day++) {
    const mm = String(month + 1).padStart(2, "0");
    const dd = String(day).padStart(2, "0");
    const datestring = year + "-" + mm + "-" + dd;
    const isbooked = bookeddates[datestring] ? "booked" : "";
    const istoday = datestring === todaystring() ? "today" : "";
    cellshtml += '<div class="calendarday ' + isbooked + " " + istoday + '">' + day + "</div>";
  }

  container.innerHTML =
    '<div class="calendarheader"><h3>' +
    monthnames[month] +
    " " +
    year +
    "</h3></div>" +
    '<div class="calendargrid">' +
    cellshtml +
    "</div>";
}

function initfacilitiespage() {
  populatelocations();
  renderresourcelist();
  renderdetailpanel();

  document.getElementById("searchinput").addEventListener("input", function () {
    renderresourcelist();
  });
  document.getElementById("typeinput").addEventListener("change", function () {
    renderresourcelist();
  });
  document.getElementById("locationinput").addEventListener("change", function () {
    renderresourcelist();
  });
  document.getElementById("capacityinput").addEventListener("input", function () {
    renderresourcelist();
  });
}

document.addEventListener("DOMContentLoaded", initfacilitiespage);
```

- [ ] **Step 2: Add the script tag reference verification and syntax check**

Run: `node --check facilities.js`
Expected: no output, exit code 0.

Confirm the full file (Tasks 3 + 4 combined) defines every function `renderresourcelist()`'s click handler and `initfacilitiespage()` call: `populatelocations`, `statusbadgeclass`, `statuslabel`, `typelabel`, `filteredresources`, `renderresourcelist`, `todaystring`, `renderdetailpanel`, `renderbookinglist`, `rendercalendar`, `initfacilitiespage` — no forward references to anything still undefined.

- [ ] **Step 3: Manual browser verification**

No browser tool is available in this environment — do the best static verification possible (confirm all referenced element IDs exist in `facilities.html`: `searchinput`, `typeinput`, `locationinput`, `capacityinput`, `resourcelist`, `detailpanel`; confirm all referenced CSS classes exist in `styles.css`: `filterbar`, `filterfield`, `resourcelayout`, `resourcelist`, `resourceitem`, `resourcename`, `resourcemeta`, `detailpanel`, `calendarheader`, `calendargrid`, `calendarweekday`, `calendarday`, `bookinglist`, `bookinglistitem`, `badge`/`badgesuccess`/`badgewarning`/`badgedanger`, `emptystate`). Note in your report that full interactive/visual verification (clicking a resource, seeing the calendar and booking list render, typing in the search box, changing filters) needs a human opening `facilities.html` in a real browser.

- [ ] **Step 4: Commit**

```bash
git add facilities.js
git commit -m "Add facility detail panel with availability calendar"
```

---

### Task 5: Push Part 2 to GitHub

**Files:** none (git only)

- [ ] **Step 1: Push all Part 2 commits**

```bash
git push origin master
```

- [ ] **Step 2: Verify on GitHub**

Confirm `facilities.html` and `facilities.js` are present at the repo root alongside the Part 1 files, and `styles.css` reflects the new appended rules. Confirm no `.claude`, `.superpowers`, or hyphenated/underscored filenames appear anywhere in the tree.
