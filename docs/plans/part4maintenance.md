# Part 4 Maintenance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `maintenance.html` — an issue-reporting form open to any role, a community "My Reports" read-only list, and a staff "Task Queue" with assignment (to one of a small fixed set of staff members) and status progression (reported → assigned → in progress → resolved).

**Architecture:** One new page (`maintenance.html`), following the exact same always-visible-form-plus-role-conditional-sections pattern established by `bookings.html` in Part 3. No new CSS is needed — the existing form, table, badge, and message-banner styles from Parts 1–3 cover everything this page needs. `maintenance.js` reads/writes `getMaintenanceTasks()`/`saveMaintenanceTasks()` and calls `addAuditEntry()` for every state change (report, assign, start, resolve) — all already built in Part 1's `data.js`.

**Tech Stack:** Plain HTML/CSS/JavaScript, no framework, no build step, browser `localStorage` via the existing `data.js`.

**Note on verification:** No automated test framework exists for this project. Each task's "verify" step is a manual/static check instead of an automated test run.

---

## File Structure

- `maintenance.html` — new page shell: report form, "My Reports" table, "Task Queue" table. Built in Task 1.
- `maintenance.js` — new page script. Built across Tasks 2–3: helpers + form submission first, then list rendering + assign/start/resolve actions + init wiring.

No changes to `styles.css` are needed — `.formrow`, `.tablewrap`, `.badge`/`badgesuccess`/`badgewarning`/`badgedanger`/`badgeinfo`, `.btn`/`btnprimary`/`btnsecondary`, `.confirmmessage`/`.errormessage`, and `.emptystate` (all already built in Parts 1–3) cover this page completely.

---

### Task 1: Maintenance page shell

**Files:**
- Create: `maintenance.html`

- [ ] **Step 1: Create `maintenance.html`**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Maintenance - Riverbend Council Facilities</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <div class="page">
      <div id="sitenav"></div>
      <main class="main">
        <div class="container">
          <h1>Maintenance</h1>
          <p class="subtitle">Report a maintenance issue, and track its progress.</p>

          <div id="confirmmessage"></div>

          <h2>Report an Issue</h2>
          <form id="maintenanceform">
            <div class="formrow">
              <div>
                <label for="resourceselect">Resource</label>
                <select id="resourceselect" required></select>
              </div>
              <div>
                <label for="priorityinput">Priority</label>
                <select id="priorityinput" required>
                  <option value="low">Low</option>
                  <option value="medium" selected>Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div class="formrow">
              <div>
                <label for="reportedbyinput">Your name</label>
                <input type="text" id="reportedbyinput" required />
              </div>
            </div>
            <div>
              <label for="descriptioninput">Description</label>
              <input type="text" id="descriptioninput" required />
            </div>
            <button type="submit" class="btn btnprimary">Submit report</button>
          </form>

          <div id="myreportssection">
            <h2>My Reports</h2>
            <div class="tablewrap">
              <table id="myreportstable">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody id="myreportsbody"></tbody>
              </table>
            </div>
          </div>

          <div id="taskqueuesection">
            <h2>Task Queue</h2>
            <div class="tablewrap">
              <table id="taskqueuetable">
                <thead>
                  <tr>
                    <th>Resource</th>
                    <th>Description</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Assigned to</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody id="taskqueuebody"></tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
    <script src="data.js"></script>
    <script src="nav.js"></script>
    <script src="maintenance.js"></script>
  </body>
</html>
```

- [ ] **Step 2: Verify**

Re-read the file and confirm: script order is `data.js`, `nav.js`, `maintenance.js`; every element ID referenced by upcoming JS tasks exists exactly as spelled (`confirmmessage`, `maintenanceform`, `resourceselect`, `priorityinput`, `reportedbyinput`, `descriptioninput`, `myreportssection`, `myreportstable`, `myreportsbody`, `taskqueuesection`, `taskqueuetable`, `taskqueuebody`); table header column counts: `myreportstable` has 4 columns, `taskqueuetable` has 6 columns (including one blank action column).

- [ ] **Step 3: Commit**

```bash
git add maintenance.html
git commit -m "Add maintenance page shell with report form"
```

---

### Task 2: Maintenance helpers and report submission

**Files:**
- Create: `maintenance.js`

- [ ] **Step 1: Create `maintenance.js` with helpers and the form submit handler**

```javascript
const STAFFMEMBERS = ["Dave Whitfield", "Priya Shah", "Tom Nguyen"];

function resourcename(resourceid) {
  const resource = getResources().filter(function (r) {
    return r.id === resourceid;
  })[0];
  return resource ? resource.name : "Unknown resource";
}

function prioritylabel(priority) {
  if (priority === "high") {
    return "High";
  }
  if (priority === "medium") {
    return "Medium";
  }
  return "Low";
}

function maintenancestatusbadgeclass(status) {
  if (status === "reported") {
    return "badgedanger";
  }
  if (status === "assigned") {
    return "badgewarning";
  }
  if (status === "in_progress") {
    return "badgeinfo";
  }
  return "badgesuccess";
}

function maintenancestatuslabel(status) {
  if (status === "reported") {
    return "Reported";
  }
  if (status === "assigned") {
    return "Assigned";
  }
  if (status === "in_progress") {
    return "In progress";
  }
  return "Resolved";
}

function populatemaintenanceresourceoptions() {
  const select = document.getElementById("resourceselect");
  const resources = getResources();

  const placeholder = document.createElement("option");
  placeholder.value = "";
  placeholder.textContent = "Select a resource…";
  placeholder.disabled = true;
  placeholder.selected = true;
  select.appendChild(placeholder);

  resources.forEach(function (r) {
    const option = document.createElement("option");
    option.value = r.id;
    option.textContent = r.name;
    select.appendChild(option);
  });
}

function showmaintenancemessage(text, iswarning) {
  const box = document.getElementById("confirmmessage");
  const cssclass = iswarning ? "errormessage" : "confirmmessage";
  box.innerHTML = '<div class="' + cssclass + '">' + text + "</div>";
}

function handlemaintenancesubmit(event) {
  event.preventDefault();

  const resourceid = document.getElementById("resourceselect").value;
  const priority = document.getElementById("priorityinput").value;
  const reportedby = document.getElementById("reportedbyinput").value.trim();
  const description = document.getElementById("descriptioninput").value.trim();

  if (!resourceid || !priority || !reportedby || !description) {
    showmaintenancemessage("Please fill in every field before submitting.", true);
    return;
  }

  const task = {
    id: "m" + Date.now(),
    resourceId: resourceid,
    reportedBy: reportedby,
    description: description,
    priority: priority,
    status: "reported",
    assignedTo: null,
    createdAt: new Date().toISOString()
  };

  const tasks = getMaintenanceTasks();
  tasks.push(task);
  saveMaintenanceTasks(tasks);
  addAuditEntry(reportedby, "maintenance_reported", "Reported an issue with " + resourcename(resourceid));

  showmaintenancemessage("Thanks, your maintenance report has been submitted.", false);

  document.getElementById("maintenanceform").reset();
  populatemaintenanceresourceoptions();
  renderallmaintenanceviews();
}
```

- [ ] **Step 2: Verify**

Run: `node --check maintenance.js`
Expected: no output, exit code 0.

Note: `handlemaintenancesubmit()` calls `renderallmaintenanceviews()`, which is NOT defined until Task 3 (a later task). That's expected — this file isn't wired to run yet. `node --check` only validates syntax, so this is fine.

- [ ] **Step 3: Commit**

```bash
git add maintenance.js
git commit -m "Add maintenance helpers and report submission"
```

---

### Task 3: Maintenance list rendering, actions, and page init

**Files:**
- Modify: `maintenance.js` (append)

- [ ] **Step 1: Append rendering, actions, and init wiring to `maintenance.js`**

```javascript
function rendermyreports() {
  const body = document.getElementById("myreportsbody");
  const tasks = getMaintenanceTasks().slice().sort(function (a, b) {
    return b.createdAt.localeCompare(a.createdAt);
  });

  if (tasks.length === 0) {
    body.innerHTML = '<tr><td colspan="4" class="emptystate">No maintenance reports yet.</td></tr>';
    return;
  }

  body.innerHTML = tasks
    .map(function (t) {
      return (
        "<tr>" +
        "<td>" +
        resourcename(t.resourceId) +
        "</td>" +
        "<td>" +
        t.description +
        "</td>" +
        "<td>" +
        prioritylabel(t.priority) +
        "</td>" +
        '<td><span class="badge ' +
        maintenancestatusbadgeclass(t.status) +
        '">' +
        maintenancestatuslabel(t.status) +
        "</span></td>" +
        "</tr>"
      );
    })
    .join("");
}

function rendertaskqueue() {
  const body = document.getElementById("taskqueuebody");
  const tasks = getMaintenanceTasks().slice().sort(function (a, b) {
    return b.createdAt.localeCompare(a.createdAt);
  });

  if (tasks.length === 0) {
    body.innerHTML = '<tr><td colspan="6" class="emptystate">No maintenance tasks yet.</td></tr>';
    return;
  }

  body.innerHTML = tasks
    .map(function (t) {
      let actionshtml = "";
      if (t.status === "reported") {
        actionshtml =
          '<select data-assignselect="' +
          t.id +
          '">' +
          STAFFMEMBERS.map(function (name) {
            return '<option value="' + name + '">' + name + "</option>";
          }).join("") +
          "</select> " +
          '<button type="button" class="btn btnprimary" data-assign="' +
          t.id +
          '">Assign</button>';
      } else if (t.status === "assigned") {
        actionshtml =
          '<button type="button" class="btn btnsecondary" data-start="' +
          t.id +
          '">Start work</button> ' +
          '<button type="button" class="btn btnprimary" data-resolve="' +
          t.id +
          '">Mark resolved</button>';
      } else if (t.status === "in_progress") {
        actionshtml = '<button type="button" class="btn btnprimary" data-resolve="' + t.id + '">Mark resolved</button>';
      }

      return (
        "<tr>" +
        "<td>" +
        resourcename(t.resourceId) +
        "</td>" +
        "<td>" +
        t.description +
        "</td>" +
        "<td>" +
        prioritylabel(t.priority) +
        "</td>" +
        '<td><span class="badge ' +
        maintenancestatusbadgeclass(t.status) +
        '">' +
        maintenancestatuslabel(t.status) +
        "</span></td>" +
        "<td>" +
        (t.assignedTo ? t.assignedTo : "—") +
        "</td>" +
        "<td>" +
        actionshtml +
        "</td>" +
        "</tr>"
      );
    })
    .join("");

  body.querySelectorAll("[data-assign]").forEach(function (button) {
    button.addEventListener("click", function () {
      const id = button.getAttribute("data-assign");
      const select = body.querySelector('[data-assignselect="' + id + '"]');
      assigntask(id, select.value);
    });
  });
  body.querySelectorAll("[data-start]").forEach(function (button) {
    button.addEventListener("click", function () {
      starttask(button.getAttribute("data-start"));
    });
  });
  body.querySelectorAll("[data-resolve]").forEach(function (button) {
    button.addEventListener("click", function () {
      resolvetask(button.getAttribute("data-resolve"));
    });
  });
}

function assigntask(id, assignedto) {
  const tasks = getMaintenanceTasks();
  const task = tasks.filter(function (t) {
    return t.id === id;
  })[0];
  if (!task) {
    return;
  }
  task.status = "assigned";
  task.assignedTo = assignedto;
  saveMaintenanceTasks(tasks);
  addAuditEntry("Council Staff", "maintenance_assigned", "Assigned task for " + resourcename(task.resourceId) + " to " + assignedto);
  renderallmaintenanceviews();
}

function starttask(id) {
  const tasks = getMaintenanceTasks();
  const task = tasks.filter(function (t) {
    return t.id === id;
  })[0];
  if (!task) {
    return;
  }
  task.status = "in_progress";
  saveMaintenanceTasks(tasks);
  addAuditEntry("Council Staff", "maintenance_started", "Started work on task for " + resourcename(task.resourceId));
  renderallmaintenanceviews();
}

function resolvetask(id) {
  const tasks = getMaintenanceTasks();
  const task = tasks.filter(function (t) {
    return t.id === id;
  })[0];
  if (!task) {
    return;
  }
  task.status = "resolved";
  saveMaintenanceTasks(tasks);
  addAuditEntry("Council Staff", "maintenance_resolved", "Resolved task for " + resourcename(task.resourceId));
  renderallmaintenanceviews();
}

function renderallmaintenanceviews() {
  const role = getRole();
  document.getElementById("myreportssection").hidden = role !== "community";
  document.getElementById("taskqueuesection").hidden = role !== "staff";

  if (role === "community") {
    rendermyreports();
  } else {
    rendertaskqueue();
  }
}

function initmaintenancepage() {
  populatemaintenanceresourceoptions();
  renderallmaintenanceviews();
  document.getElementById("maintenanceform").addEventListener("submit", handlemaintenancesubmit);
}

document.addEventListener("DOMContentLoaded", initmaintenancepage);
```

- [ ] **Step 2: Syntax check**

Run: `node --check maintenance.js`
Expected: no output, exit code 0.

Confirm the full file (Tasks 2 + 3 combined) has no forward references left undefined: `STAFFMEMBERS`, `resourcename`, `prioritylabel`, `maintenancestatusbadgeclass`, `maintenancestatuslabel`, `populatemaintenanceresourceoptions`, `showmaintenancemessage`, `handlemaintenancesubmit`, `rendermyreports`, `rendertaskqueue`, `assigntask`, `starttask`, `resolvetask`, `renderallmaintenanceviews`, `initmaintenancepage` should all be defined.

- [ ] **Step 3: Manual static verification (no browser available)**

Confirm every element ID this code references exists in `maintenance.html` (`resourceselect`, `priorityinput`, `reportedbyinput`, `descriptioninput`, `confirmmessage`, `maintenanceform`, `myreportssection`, `myreportsbody`, `taskqueuesection`, `taskqueuebody`). Confirm every CSS class referenced exists in `styles.css` (`confirmmessage`, `errormessage`, `badge`/`badgesuccess`/`badgewarning`/`badgedanger`/`badgeinfo`, `btn`/`btnprimary`/`btnsecondary`, `emptystate`, `tablewrap`). Note that full interactive verification (submitting a report, assigning, starting, resolving) needs a human with a real browser.

- [ ] **Step 4: Commit**

```bash
git add maintenance.js
git commit -m "Add maintenance task queue, assignment, and status updates"
```

---

### Task 4: Push Part 4 to GitHub

**Files:** none (git only)

- [ ] **Step 1: Push all Part 4 commits**

```bash
git push origin master
```

- [ ] **Step 2: Verify on GitHub**

Confirm `maintenance.html` and `maintenance.js` are present at the repo root alongside the Part 1–3 files. Confirm no `.claude`, `.superpowers`, or hyphenated/underscored filenames appear anywhere in the tree, and no commit messages carry a Claude/AI attribution trailer.
