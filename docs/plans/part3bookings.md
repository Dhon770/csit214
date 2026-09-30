# Part 3 Bookings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `bookings.html` — a booking request form with conflict detection, a community "My Bookings" list with cancellation, and a staff approvals queue (with conflict warnings) plus a read-only all-bookings table.

**Architecture:** One new page (`bookings.html`) with one always-visible request form, and two role-conditional sections toggled via the native `hidden` attribute based on `getRole()`: "My Bookings" (community) and "Approvals" + "All Bookings" (staff). Conflict detection is a pure function comparing a booking's resource/date/time-range against other approved/pending bookings for the same resource. `bookings.js` reads/writes `getBookings()`/`saveBookings()` and calls `addAuditEntry()` for every state change (request, approve, reject, cancel) — all already built in Part 1's `data.js`. A small, precise edit to Part 2's `facilities.js` adds a "Request this booking" link from the facility detail panel, completing the cross-page flow the design doc anticipated.

**Tech Stack:** Plain HTML/CSS/JavaScript, no framework, no build step, browser `localStorage` via the existing `data.js`.

**Note on verification:** No automated test framework exists for this project. Each task's "verify" step is a manual/static check instead of an automated test run.

---

## File Structure

- `styles.css` — append a small set of booking-page styles: two message-banner variants, an inline per-row conflict note, a table-scroll wrapper, and a neutral badge variant for "cancelled" bookings. Built in Task 1.
- `bookings.html` — new page shell: request form, "My Bookings" table, "Approvals" table, "All Bookings" table. Built in Task 2.
- `bookings.js` — new page script. Built across Tasks 3–4: helpers + form submission first, then list rendering + approve/reject/cancel actions + init wiring.
- `facilities.js` — Task 5 makes one precise, scoped edit to the existing `renderdetailpanel()` function (built in Part 2) to add a "Request this booking" link.

---

### Task 1: Booking page styles

**Files:**
- Modify: `styles.css` (append)

- [ ] **Step 1: Append message banner, conflict note, table wrapper, and neutral badge styles to `styles.css`**

```css
.confirmmessage {
  background: var(--color-success-bg);
  color: var(--color-success);
  padding: var(--spacing3);
  border-radius: var(--radius);
  margin-bottom: var(--spacing4);
}

.errormessage {
  background: var(--color-warning-bg);
  color: var(--color-warning);
  padding: var(--spacing3);
  border-radius: var(--radius);
  margin-bottom: var(--spacing4);
}

.conflictwarning {
  color: var(--color-danger);
  font-size: 12px;
  margin-top: var(--spacing1);
}

.tablewrap {
  overflow-x: auto;
  margin-bottom: var(--spacing5);
}

.badgemuted {
  background: var(--color-bg);
  color: var(--color-text-muted);
}
```

- [ ] **Step 2: Commit**

```bash
git add styles.css
git commit -m "Add booking page styles"
```

---

### Task 2: Bookings page shell

**Files:**
- Create: `bookings.html`

- [ ] **Step 1: Create `bookings.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Bookings - Riverbend Council Facilities</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="page">
      <div id="sitenav"></div>
      <main class="main">
        <div class="container">
          <h1>Bookings</h1>
          <p class="subtitle">Request a booking, and manage existing bookings.</p>

          <div id="confirmmessage"></div>

          <h2>Request a Booking</h2>
          <form id="bookingform">
            <div class="formrow">
              <div>
                <label for="resourceselect">Resource</label>
                <select id="resourceselect" required></select>
              </div>
              <div>
                <label for="dateinput">Date</label>
                <input type="date" id="dateinput" required />
              </div>
            </div>
            <div class="formrow">
              <div>
                <label for="starttimeinput">Start time</label>
                <input type="time" id="starttimeinput" required />
              </div>
              <div>
                <label for="endtimeinput">End time</label>
                <input type="time" id="endtimeinput" required />
              </div>
            </div>
            <div class="formrow">
              <div>
                <label for="requestedbyinput">Your name</label>
                <input type="text" id="requestedbyinput" required />
              </div>
              <div>
                <label for="purposeinput">Purpose</label>
                <input type="text" id="purposeinput" required />
              </div>
            </div>
            <button type="submit" class="btn btnprimary">Submit request</button>
          </form>

          <div id="mybookingssection">
            <h2>My Bookings</h2>
            <div class="tablewrap">
              <table id="mybookingstable">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="mybookingsbody"></tbody>
              </table>
            </div>
          </div>

          <div id="approvalssection">
            <h2>Approvals</h2>
            <div class="tablewrap">
              <table id="approvalstable">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Requested by</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Purpose</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="approvalsbody"></tbody>
              </table>
            </div>

            <h2>All Bookings</h2>
            <div class="tablewrap">
              <table id="allbookingstable">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Requested by</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="allbookingsbody"></tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
    <script src="data.js"></script>
    <script src="nav.js"></script>
    <script src="bookings.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify**

Re-read the file and confirm: script order is `data.js`, `nav.js`, `bookings.js`; every element ID referenced by the plan's upcoming JS tasks exists exactly as spelled (`confirmmessage`, `bookingform`, `resourceselect`, `dateinput`, `starttimeinput`, `endtimeinput`, `requestedbyinput`, `purposeinput`, `mybookingssection`, `mybookingstable`, `mybookingsbody`, `approvalssection`, `approvalstable`, `approvalsbody`, `allbookingstable`, `allbookingsbody`); table header column counts match what later tasks' JS will render (`mybookingstable` and `approvalstable` have 6 columns each including one blank action column; `allbookingstable` has 5 columns).

- [ ] **Step 3: Commit**

```bash
git add bookings.html
git commit -m "Add bookings page shell with request form"
```

---

### Task 3: Booking helpers and request submission

**Files:**
- Create: `bookings.js`

- [ ] **Step 1: Create `bookings.js` with helpers and the form submit handler**

```javascript
function resourcename(resourceid) {
  const resource = getResources().filter(function (r) {
    return r.id === resourceid;
  })[0];
  return resource ? resource.name : "Unknown resource";
}

function overlaps(a, b) {
  return a.resourceId === b.resourceId && a.date === b.date && a.startTime < b.endTime && b.startTime < a.endTime;
}

function hasconflict(booking, allbookings) {
  return allbookings.some(function (other) {
    if (other.id === booking.id) {
      return false;
    }
    if (other.status !== "approved" && other.status !== "pending") {
      return false;
    }
    return overlaps(booking, other);
  });
}

function getqueryresourceid() {
  const params = new URLSearchParams(window.location.search);
  return params.get("resource");
}

function populateresourceoptions() {
  const select = document.getElementById("resourceselect");
  const resources = getResources().filter(function (r) {
    return r.status === "available";
  });
  const preselect = getqueryresourceid();

  resources.forEach(function (r) {
    const option = document.createElement("option");
    option.value = r.id;
    option.textContent = r.name;
    if (r.id === preselect) {
      option.selected = true;
    }
    select.appendChild(option);
  });
}

function showconfirmmessage(text, iswarning) {
  const box = document.getElementById("confirmmessage");
  const cssclass = iswarning ? "errormessage" : "confirmmessage";
  box.innerHTML = '<div class="' + cssclass + '">' + text + "</div>";
}

function handlebookingsubmit(event) {
  event.preventDefault();

  const resourceid = document.getElementById("resourceselect").value;
  const date = document.getElementById("dateinput").value;
  const starttime = document.getElementById("starttimeinput").value;
  const endtime = document.getElementById("endtimeinput").value;
  const requestedby = document.getElementById("requestedbyinput").value.trim();
  const purpose = document.getElementById("purposeinput").value.trim();

  if (!resourceid || !date || !starttime || !endtime || !requestedby || !purpose) {
    showconfirmmessage("Please fill in every field before submitting.", true);
    return;
  }

  if (endtime <= starttime) {
    showconfirmmessage("End time must be after start time.", true);
    return;
  }

  const booking = {
    id: "b" + Date.now(),
    resourceId: resourceid,
    requestedBy: requestedby,
    date: date,
    startTime: starttime,
    endTime: endtime,
    purpose: purpose,
    status: "pending",
    createdAt: new Date().toISOString()
  };

  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);
  addAuditEntry(requestedby, "booking_requested", "Requested booking of " + resourcename(resourceid) + " on " + date);

  const conflict = hasconflict(booking, bookings);
  if (conflict) {
    showconfirmmessage(
      "Booking request submitted as pending. Note: this time overlaps with another booking for the same resource, so it may need staff review.",
      true
    );
  } else {
    showconfirmmessage("Booking request submitted and is pending approval.", false);
  }

  document.getElementById("bookingform").reset();
  populateresourceoptions();
  renderallviews();
}
```

- [ ] **Step 2: Verify**

Run: `node --check bookings.js`
Expected: no output, exit code 0.

Note: `handlebookingsubmit()` calls `renderallviews()`, which is NOT defined until Task 4. That's expected — this file isn't wired to run yet (no `DOMContentLoaded` listener calls anything until Task 4 adds it). `node --check` only validates syntax, so this is fine.

- [ ] **Step 3: Commit**

```bash
git add bookings.js
git commit -m "Add booking helpers and request submission"
```

---

### Task 4: Booking list rendering, actions, and page init

**Files:**
- Modify: `bookings.js` (append)

- [ ] **Step 1: Append status helpers, rendering, actions, and init wiring to `bookings.js`**

```javascript
function bookingstatusbadgeclass(status) {
  if (status === "approved") {
    return "badgesuccess";
  }
  if (status === "pending") {
    return "badgewarning";
  }
  if (status === "cancelled") {
    return "badgemuted";
  }
  return "badgedanger";
}

function bookingstatuslabel(status) {
  if (status === "approved") {
    return "Approved";
  }
  if (status === "pending") {
    return "Pending";
  }
  if (status === "cancelled") {
    return "Cancelled";
  }
  return "Rejected";
}

function rendermybookings() {
  const body = document.getElementById("mybookingsbody");
  const bookings = getBookings().slice().sort(function (a, b) {
    return b.createdAt.localeCompare(a.createdAt);
  });

  if (bookings.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="emptystate">No bookings yet.</td></tr>';
    return;
  }

  body.innerHTML = bookings
    .map(function (b) {
      const cancelbutton =
        b.status === "pending" || b.status === "approved"
          ? '<button type="button" class="btn btnsecondary" data-cancel="' + b.id + '">Cancel</button>'
          : "";
      return (
        "<tr>" +
        "<td>" +
        resourcename(b.resourceId) +
        "</td>" +
        "<td>" +
        b.date +
        "</td>" +
        "<td>" +
        b.startTime +
        "–" +
        b.endTime +
        "</td>" +
        "<td>" +
        b.purpose +
        "</td>" +
        '<td><span class="badge ' +
        bookingstatusbadgeclass(b.status) +
        '">' +
        bookingstatuslabel(b.status) +
        "</span></td>" +
        "<td>" +
        cancelbutton +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  body.querySelectorAll("[data-cancel]").forEach(function (button) {
    button.addEventListener("click", function () {
      cancelbooking(button.getAttribute("data-cancel"));
    });
  });
}

function renderapprovals() {
  const body = document.getElementById("approvalsbody");
  const allbookings = getBookings();
  const pending = allbookings.filter(function (b) {
    return b.status === "pending";
  });

  if (pending.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="emptystate">No bookings awaiting approval.</td></tr>';
    return;
  }

  body.innerHTML = pending
    .map(function (b) {
      const conflictnote = hasconflict(b, allbookings)
        ? '<div class="conflictwarning">Conflicts with another booking</div>'
        : "";
      return (
        "<tr>" +
        "<td>" +
        resourcename(b.resourceId) +
        conflictnote +
        "</td>" +
        "<td>" +
        b.requestedBy +
        "</td>" +
        "<td>" +
        b.date +
        "</td>" +
        "<td>" +
        b.startTime +
        "–" +
        b.endTime +
        "</td>" +
        "<td>" +
        b.purpose +
        "</td>" +
        "<td>" +
        '<button type="button" class="btn btnprimary" data-approve="' +
        b.id +
        '">Approve</button> ' +
        '<button type="button" class="btn btndanger" data-reject="' +
        b.id +
        '">Reject</button>' +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  body.querySelectorAll("[data-approve]").forEach(function (button) {
    button.addEventListener("click", function () {
      approvebooking(button.getAttribute("data-approve"));
    });
  });
  body.querySelectorAll("[data-reject]").forEach(function (button) {
    button.addEventListener("click", function () {
      rejectbooking(button.getAttribute("data-reject"));
    });
  });
}

function renderallbookings() {
  const body = document.getElementById("allbookingsbody");
  const bookings = getBookings().slice().sort(function (a, b) {
    return b.createdAt.localeCompare(a.createdAt);
  });

  if (bookings.length === 0) {
    body.innerHTML = '<tr><td colspan="5" class="emptystate">No bookings yet.</td></tr>';
    return;
  }

  body.innerHTML = bookings
    .map(function (b) {
      return (
        "<tr>" +
        "<td>" +
        resourcename(b.resourceId) +
        "</td>" +
        "<td>" +
        b.requestedBy +
        "</td>" +
        "<td>" +
        b.date +
        "</td>" +
        "<td>" +
        b.startTime +
        "–" +
        b.endTime +
        "</td>" +
        '<td><span class="badge ' +
        bookingstatusbadgeclass(b.status) +
        '">' +
        bookingstatuslabel(b.status) +
        "</span></td>" +
        "</tr>"
      );
    })
    .join("");
}

function approvebooking(id) {
  const bookings = getBookings();
  const booking = bookings.filter(function (b) {
    return b.id === id;
  })[0];
  if (!booking) {
    return;
  }
  booking.status = "approved";
  saveBookings(bookings);
  addAuditEntry("Council Staff", "booking_approved", "Approved booking of " + resourcename(booking.resourceId) + " for " + booking.requestedBy);
  renderallviews();
}

function rejectbooking(id) {
  const bookings = getBookings();
  const booking = bookings.filter(function (b) {
    return b.id === id;
  })[0];
  if (!booking) {
    return;
  }
  booking.status = "rejected";
  saveBookings(bookings);
  addAuditEntry("Council Staff", "booking_rejected", "Rejected booking of " + resourcename(booking.resourceId) + " for " + booking.requestedBy);
  renderallviews();
}

function cancelbooking(id) {
  const bookings = getBookings();
  const booking = bookings.filter(function (b) {
    return b.id === id;
  })[0];
  if (!booking) {
    return;
  }
  booking.status = "cancelled";
  saveBookings(bookings);
  addAuditEntry(booking.requestedBy, "booking_cancelled", "Cancelled booking of " + resourcename(booking.resourceId));
  renderallviews();
}

function renderallviews() {
  const role = getRole();
  document.getElementById("mybookingssection").hidden = role !== "community";
  document.getElementById("approvalssection").hidden = role !== "staff";

  if (role === "community") {
    rendermybookings();
  } else {
    renderapprovals();
    renderallbookings();
  }
}

function initbookingspage() {
  populateresourceoptions();
  renderallviews();
  document.getElementById("bookingform").addEventListener("submit", handlebookingsubmit);
}

document.addEventListener("DOMContentLoaded", initbookingspage);
```

- [ ] **Step 2: Syntax check**

Run: `node --check bookings.js`
Expected: no output, exit code 0.

Confirm the full file (Tasks 3 + 4 combined) has no forward references left undefined: `resourcename`, `overlaps`, `hasconflict`, `getqueryresourceid`, `populateresourceoptions`, `showconfirmmessage`, `handlebookingsubmit`, `bookingstatusbadgeclass`, `bookingstatuslabel`, `rendermybookings`, `renderapprovals`, `renderallbookings`, `approvebooking`, `rejectbooking`, `cancelbooking`, `renderallviews`, `initbookingspage` should all be defined in the file, and every ID/function referenced elsewhere in the file should resolve to one of these.

- [ ] **Step 3: Manual static verification (no browser available)**

Confirm every element ID this code references exists in `bookings.html` (`resourceselect`, `dateinput`, `starttimeinput`, `endtimeinput`, `requestedbyinput`, `purposeinput`, `confirmmessage`, `bookingform`, `mybookingssection`, `mybookingsbody`, `approvalssection`, `approvalsbody`, `allbookingsbody`). Confirm every CSS class referenced exists in `styles.css` (`confirmmessage`, `errormessage`, `conflictwarning`, `tablewrap`, `badgemuted`, plus the already-existing `badge`/`badgesuccess`/`badgewarning`/`badgedanger`, `btn`/`btnprimary`/`btnsecondary`/`btndanger`, `emptystate`). Note that full interactive verification (submitting the form, approving/rejecting, cancelling, seeing conflict warnings) needs a human with a real browser.

- [ ] **Step 4: Commit**

```bash
git add bookings.js
git commit -m "Add booking list rendering, approvals, and cancellation"
```

---

### Task 5: Link facility detail panel to booking requests

**Files:**
- Modify: `facilities.js` (targeted edit inside the existing `renderdetailpanel()` function, built in Part 2)

- [ ] **Step 1: Add a "Request this booking" link to `renderdetailpanel()`**

Find this exact block in `facilities.js` (it is the `panel.innerHTML = ...` assignment inside `renderdetailpanel()`):

```javascript
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
```

Replace it with this (adds a `bookinglinkhtml` variable computed just above the assignment, and inserts it between the status badge and the description paragraph):

```javascript
  const bookinglinkhtml =
    resource.status === "available"
      ? '<p><a class="btn btnprimary" href="bookings.html?resource=' + resource.id + '">Request this booking</a></p>'
      : "";

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
    bookinglinkhtml +
    "<p>" +
    resource.description +
    "</p>" +
    '<div id="calendarcontainer"></div>' +
    "<h3>Upcoming bookings</h3>" +
    '<ul class="bookinglist" id="bookinglist"></ul>';
```

- [ ] **Step 2: Verify**

Run: `node --check facilities.js`
Expected: no output, exit code 0.

Re-read the full function and confirm nothing else in `renderdetailpanel()` changed — only the `bookinglinkhtml` variable was added and the `bookinglinkhtml` reference was inserted into the concatenation chain in the exact position shown. Confirm `rendercalendar(bookings)` and `renderbookinglist(bookings)` (called after this assignment) are untouched.

- [ ] **Step 3: Commit**

```bash
git add facilities.js
git commit -m "Link facility detail panel to booking request form"
```

---

### Task 6: Push Part 3 to GitHub

**Files:** none (git only)

- [ ] **Step 1: Push all Part 3 commits**

```bash
git push origin master
```

- [ ] **Step 2: Verify on GitHub**

Confirm `bookings.html` and `bookings.js` are present at the repo root alongside the Part 1/Part 2 files, `styles.css` reflects the new appended rules, and `facilities.js` shows the small targeted edit from Task 5. Confirm no `.claude`, `.superpowers`, or hyphenated/underscored filenames appear anywhere in the tree.
