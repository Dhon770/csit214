# Part 5 Closures Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `closures.html` — a staff-only page to schedule a temporary closure for any resource (date range + reason), see all scheduled closures, reopen a resource when its closure ends, and manage the bookings affected by each closure (cancel them).

**Architecture:** One new, staff-only page (`closures.html`) — unlike `bookings.html`/`maintenance.html`, this page has no community-facing view at all (nav already restricts the link to the staff role), so there's no role-toggling logic needed, just three always-rendered sections: the schedule form, a closures table, and an affected-bookings table. Scheduling a closure immediately sets the resource's `status` to `"closed"`, which automatically makes it disappear from the "available" filters already used by `facilities.js`'s booking link and `bookings.js`'s resource dropdown — no changes to those files are needed. No new CSS is needed either; this page reuses the form, table, badge, and message-banner styles already built in Parts 1–4.

**Tech Stack:** Plain HTML/CSS/JavaScript, no framework, no build step, browser `localStorage` via the existing `data.js`.

**Note on verification:** No automated test framework exists for this project. Each task's "verify" step is a manual/static check instead of an automated test run.

---

## File Structure

- `closures.html` — new page shell: schedule-closure form, closures table, affected-bookings table. Built in Task 1.
- `closures.js` — new page script. Built across Tasks 2–3: helpers + form submission first, then list rendering + reopen/cancel actions + init wiring.

No changes to `styles.css` or `data.js` are needed — `getResources`/`saveResources`/`getBookings`/`saveBookings`/`getClosures`/`saveClosures`/`addAuditEntry` (Part 1) and `.formrow`/`.tablewrap`/`.badge*`/`.btn*`/`.confirmmessage`/`.errormessage`/`.emptystate` (Parts 1–4) already cover everything this page needs.

---

### Task 1: Closures page shell

**Files:**
- Create: `closures.html`

- [ ] **Step 1: Create `closures.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Closures - Riverbend Council Facilities</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="page">
      <div id="sitenav"></div>
      <main class="main">
        <div class="container">
          <h1>Closures</h1>
          <p class="subtitle">Schedule a temporary facility closure and manage affected bookings.</p>

          <div id="confirmmessage"></div>

          <h2>Schedule a Closure</h2>
          <form id="closureform">
            <div class="formrow">
              <div>
                <label for="resourceselect">Resource</label>
                <select id="resourceselect" required></select>
              </div>
              <div>
                <label for="reasoninput">Reason</label>
                <input type="text" id="reasoninput" required />
              </div>
            </div>
            <div class="formrow">
              <div>
                <label for="startdateinput">Start date</label>
                <input type="date" id="startdateinput" required />
              </div>
              <div>
                <label for="enddateinput">End date</label>
                <input type="date" id="enddateinput" required />
              </div>
            </div>
            <button type="submit" class="btn btnprimary">Schedule closure</button>
          </form>

          <h2>Closures</h2>
          <div class="tablewrap">
            <table id="closurestable">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Dates</th>
                  <th>Reason</th>
                  <th>Affected bookings</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="closuresbody"></tbody>
            </table>
          </div>

          <h2>Bookings Affected by Closures</h2>
          <div class="tablewrap">
            <table id="affectedtable">
              <thead>
                <tr>
                  <th>Resource</th>
                  <th>Requested by</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody id="affectedbody"></tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
    <script src="data.js"></script>
    <script src="nav.js"></script>
    <script src="closures.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify**

Re-read the file and confirm: script order is `data.js`, `nav.js`, `closures.js`; every element ID referenced by upcoming JS tasks exists exactly as spelled (`confirmmessage`, `closureform`, `resourceselect`, `reasoninput`, `startdateinput`, `enddateinput`, `closurestable`, `closuresbody`, `affectedtable`, `affectedbody`); table header column counts: `closurestable` has 5 columns (including one blank action column), `affectedtable` has 6 columns (including one blank action column).

- [ ] **Step 3: Commit**

```bash
git add closures.html
git commit -m "Add closures page shell with schedule form"
```

---

### Task 2: Closure helpers and scheduling submission

**Files:**
- Create: `closures.js`

- [ ] **Step 1: Create `closures.js` with helpers and the form submit handler**

```javascript
function resourcename(resourceid) {
  const resource = getResources().filter(function (r) {
    return r.id === resourceid;
  })[0];
  return resource ? resource.name : "Unknown resource";
}

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

function setresourcestatus(resourceid, status) {
  const resources = getResources();
  const resource = resources.filter(function (r) {
    return r.id === resourceid;
  })[0];
  if (!resource) {
    return;
  }
  resource.status = status;
  saveResources(resources);
}

function findaffectedbookingids(resourceid, startdate, enddate) {
  return getBookings()
    .filter(function (b) {
      return (
        b.resourceId === resourceid &&
        (b.status === "approved" || b.status === "pending") &&
        b.date >= startdate &&
        b.date <= enddate
      );
    })
    .map(function (b) {
      return b.id;
    });
}

function populateclosureresourceoptions() {
  const select = document.getElementById("resourceselect");

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a resource…";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  getResources().forEach(function (r) {
    const option = document.createElement("option");
    option.value = r.id;
    option.textContent = r.name;
    select.appendChild(option);
  });
}

function showclosuremessage(text, iswarning) {
  const box = document.getElementById("confirmmessage");
  const cssclass = iswarning ? "errormessage" : "confirmmessage";
  box.innerHTML = '<div class="' + cssclass + '">' + text + "</div>";
}

function handleclosuresubmit(event) {
  event.preventDefault();

  const resourceid = document.getElementById("resourceselect").value;
  const reason = document.getElementById("reasoninput").value.trim();
  const startdate = document.getElementById("startdateinput").value;
  const enddate = document.getElementById("enddateinput").value;

  if (!resourceid || !reason || !startdate || !enddate) {
    showclosuremessage("Please fill in every field before submitting.", true);
    return;
  }

  if (enddate < startdate) {
    showclosuremessage("End date must be on or after the start date.", true);
    return;
  }

  const affectedbookingids = findaffectedbookingids(resourceid, startdate, enddate);

  const closure = {
    id: "c" + Date.now(),
    resourceId: resourceid,
    startDate: startdate,
    endDate: enddate,
    reason: reason,
    affectedBookingIds: affectedbookingids,
    createdAt: new Date().toISOString()
  };

  const closures = getClosures();
  closures.push(closure);
  saveClosures(closures);

  setresourcestatus(resourceid, "closed");
  addAuditEntry("Council Staff", "closure_created", "Scheduled closure of " + resourcename(resourceid) + " (" + reason + ")");

  const message =
    affectedbookingids.length > 0
      ? "Closure scheduled. " + affectedbookingids.length + " existing booking(s) fall within this closure and may need to be cancelled below."
      : "Closure scheduled. No existing bookings are affected.";
  showclosuremessage(message, affectedbookingids.length > 0);

  document.getElementById("closureform").reset();
  populateclosureresourceoptions();
  renderallclosureviews();
}
```

- [ ] **Step 2: Verify**

Run: `node --check closures.js`
Expected: no output, exit code 0.

Note: `handleclosuresubmit()` calls `renderallclosureviews()`, which is NOT defined until Task 3 (a later task). That's expected — `node --check` only validates syntax.

- [ ] **Step 3: Commit**

```bash
git add closures.js
git commit -m "Add closure helpers and scheduling submission"
```

---

### Task 3: Closure list rendering, actions, and page init

**Files:**
- Modify: `closures.js` (append)

- [ ] **Step 1: Append rendering, actions, and init wiring to `closures.js`**

```javascript
function renderclosures() {
  const body = document.getElementById("closuresbody");
  const closures = getClosures().slice().sort(function (a, b) {
    return b.createdAt.localeCompare(a.createdAt);
  });

  if (closures.length === 0) {
    body.innerHTML = '<tr><td colspan="5" class="emptystate">No closures scheduled.</td></tr>';
    return;
  }

  body.innerHTML = closures
    .map(function (c) {
      return (
        "<tr>" +
        "<td>" +
        resourcename(c.resourceId) +
        "</td>" +
        "<td>" +
        c.startDate +
        " to " +
        c.endDate +
        "</td>" +
        "<td>" +
        c.reason +
        "</td>" +
        "<td>" +
        c.affectedBookingIds.length +
        "</td>" +
        "<td>" +
        '<button type="button" class="btn btnsecondary" data-reopen="' +
        c.resourceId +
        '">Reopen resource</button>' +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  body.querySelectorAll("[data-reopen]").forEach(function (button) {
    button.addEventListener("click", function () {
      reopenresource(button.getAttribute("data-reopen"));
    });
  });
}

function renderaffectedbookings() {
  const body = document.getElementById("affectedbody");
  const closures = getClosures();
  const bookings = getBookings();

  const affectedids = [];
  closures.forEach(function (c) {
    c.affectedBookingIds.forEach(function (id) {
      if (affectedids.indexOf(id) === -1) {
        affectedids.push(id);
      }
    });
  });

  const affectedbookings = bookings.filter(function (b) {
    return affectedids.indexOf(b.id) !== -1;
  });

  if (affectedbookings.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="emptystate">No bookings are affected by a closure.</td></tr>';
    return;
  }

  body.innerHTML = affectedbookings
    .map(function (b) {
      const cancelbutton =
        b.status === "pending" || b.status === "approved"
          ? '<button type="button" class="btn btndanger" data-cancel="' + b.id + '">Cancel</button>'
          : "";
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
        "<td>" +
        cancelbutton +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  body.querySelectorAll("[data-cancel]").forEach(function (button) {
    button.addEventListener("click", function () {
      cancelaffectedbooking(button.getAttribute("data-cancel"));
    });
  });
}

function reopenresource(resourceid) {
  setresourcestatus(resourceid, "available");
  addAuditEntry("Council Staff", "resource_reopened", "Reopened " + resourcename(resourceid) + " after closure");
  renderallclosureviews();
}

function cancelaffectedbooking(id) {
  const bookings = getBookings();
  const booking = bookings.filter(function (b) {
    return b.id === id;
  })[0];
  if (!booking) {
    return;
  }
  booking.status = "cancelled";
  saveBookings(bookings);
  addAuditEntry("Council Staff", "booking_cancelled", "Cancelled booking of " + resourcename(booking.resourceId) + " due to a closure");
  renderallclosureviews();
}

function renderallclosureviews() {
  renderclosures();
  renderaffectedbookings();
}

function initclosurespage() {
  populateclosureresourceoptions();
  renderallclosureviews();
  document.getElementById("closureform").addEventListener("submit", handleclosuresubmit);
}

document.addEventListener("DOMContentLoaded", initclosurespage);
```

- [ ] **Step 2: Syntax check**

Run: `node --check closures.js`
Expected: no output, exit code 0.

Confirm the full file (Tasks 2 + 3 combined) has no forward references left undefined.

- [ ] **Step 3: Manual static verification (no browser available)**

Confirm every element ID this code references exists in `closures.html` (`closuresbody`, `affectedbody`, `closureform`). Confirm every CSS class referenced exists in `styles.css` (`badge`/`badgesuccess`/`badgewarning`/`badgedanger`/`badgemuted`, `btn`/`btnsecondary`/`btndanger`, `emptystate`). Note that full interactive verification (scheduling a closure, seeing affected bookings appear, cancelling one, reopening a resource) needs a human with a real browser.

- [ ] **Step 4: Commit**

```bash
git add closures.js
git commit -m "Add closures list, reopen action, and affected-booking cancellation"
```

---

### Task 4: Push Part 5 to GitHub

**Files:** none (git only)

- [ ] **Step 1: Push all Part 5 commits**

```bash
git push origin master
```

- [ ] **Step 2: Verify on GitHub**

Confirm `closures.html` and `closures.js` are present at the repo root alongside the Part 1–4 files. Confirm no `.claude`, `.superpowers`, or hyphenated/underscored filenames appear anywhere in the tree, and no commit messages carry a Claude/AI attribution trailer.
