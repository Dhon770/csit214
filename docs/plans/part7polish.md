# Part 7 Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Finish the project with a README for the repo, a responsive/empty-state audit across all six pages, and a final push — completing the Build & Push Order from `docs/design/design.md`.

**Architecture:** No new pages or data model changes. Task 1 adds a `README.md` at the repo root (content fully specified below). Task 2 is a verification pass across every existing page and stylesheet rule, checking phone-width layout and empty-state coverage against a concrete checklist — any genuine bug found gets a minimal, targeted fix; if nothing is found, no code changes are made (this is quality assurance, not an excuse to invent speculative changes).

**Tech Stack:** Plain HTML/CSS/JavaScript, no framework, no build step, browser `localStorage` via the existing `data.js`.

**Note on verification:** No automated test framework exists for this project, and no browser is available to the implementer. Task 2's checklist is answered by reading the actual CSS rules and JS rendering code and reasoning through concrete viewport widths and data states, not by visual inspection.

---

## File Structure

- `README.md` — new file at the repo root. Built in Task 1.
- `styles.css` / any page's `.js` file — touched ONLY in Task 2, and only if the audit finds a genuine, concrete bug (not for speculative polish).

---

### Task 1: Add project README

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# Riverbend Council Facility Booking System

A frontend-only prototype for managing council facilities, rooms, and equipment: searching and checking availability, requesting and approving bookings, detecting conflicts, cancelling bookings, reporting and assigning maintenance, scheduling temporary closures, and viewing utilisation reports and audit history.

This is a university assignment prototype (CSIT214 IT Project Management) for a fictional council, "Riverbend Council". It is built with plain HTML, CSS, and JavaScript — no framework, no build step, no backend. All data is seeded into the browser's `localStorage` on first load and persists across reloads.

## Running it

Open `index.html` directly in a web browser (double-click the file, or open it from your browser's File menu). No server, build step, or installation is required.

## Roles

There is no real login system. A role switcher in the top navigation bar lets you view the app as either:

- **Community Member** — search facilities, check availability, submit booking requests, view and cancel bookings, report maintenance issues.
- **Council Staff** — everything above, plus: approve/reject booking requests, assign and update maintenance tasks, schedule temporary closures and manage affected bookings, and view utilisation reports and audit history.

## Pages

- `index.html` — Dashboard with role-specific summary stats.
- `facilities.html` — Search and filter facilities, rooms, and equipment; view an availability calendar and upcoming bookings for each.
- `bookings.html` — Submit a booking request (with conflict detection), view and cancel your bookings, or (staff) approve/reject pending requests.
- `maintenance.html` — Report a maintenance issue, or (staff) assign and track maintenance tasks through to resolution.
- `closures.html` — (Staff) schedule a temporary closure for a resource and manage any bookings affected by it.
- `reports.html` — (Staff) utilisation charts and a searchable audit history of every booking, maintenance, and closure action.

## Data

All data lives in the browser's `localStorage`, seeded with sample facilities, bookings, maintenance tasks, and closures on first load. Clearing your browser's site data for this page will reset it back to the original sample data.

## Scope

As a prototype, this project deliberately does not include: real authentication, a backend/database, payment handling, or real email/SMS notifications. See `docs/design/design.md` for the full design rationale.
```

- [ ] **Step 2: Verify**

Re-read the file and confirm it lists all six actual page files in the repo (`index.html`, `facilities.html`, `bookings.html`, `maintenance.html`, `closures.html`, `reports.html`) and that the "Running it" instructions don't reference any build tooling that doesn't exist in this project.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "Add project README"
```

---

### Task 2: Responsive and empty-state audit

**Files:**
- Read-only review of: `styles.css`, `index.html`, `facilities.html`, `bookings.html`, `maintenance.html`, `closures.html`, `reports.html`, and their corresponding `.js` files.
- Modify (ONLY if a genuine issue is found): `styles.css` or the relevant page's `.js` file, with a minimal, targeted fix.

- [ ] **Step 1: Phone-width layout check (reason through it at ~360-400px viewport width, no browser needed)**

For each of the following, read the actual CSS rule in `styles.css` and confirm it will not cause horizontal overflow or unusable layout at a 360-400px viewport width (`.container` has 16px side padding, so usable content width is roughly 330-370px):

- `.navinner` (`.sitenav` header): flex with `flex-wrap: wrap` — confirm the brand link, nav links list, and role switcher wrap onto multiple lines rather than overflowing.
- `.cardgrid` (dashboard stat cards): `grid-template-columns: repeat(auto-fit, minmax(220px, 1fr))` — confirm this collapses to a single column at narrow widths without any card overflowing.
- `.filterbar`/`.filterfield` (facilities page filters) and `.formrow` (every form across the app): confirm these wrap/stack without overflow.
- `.resourcelayout` (facilities page): already has an explicit `@media (max-width: 720px)` rule collapsing to one column — confirm this rule is present and correctly triggers before 400px.
- `.tablewrap` (every data table — bookings, maintenance, closures, affected bookings): confirm `overflow-x: auto` is present so wide tables scroll horizontally instead of breaking page layout.
- `.barchart`/`.barrow` (reports page charts): `.barlabel` is a fixed `160px`, `.barvalue` is a fixed `30px`, `.bartrack` is `flex: 1` with no `min-width` — confirm the fixed-width parts (160 + 30 + two gaps at `var(--spacing3)` ≈ 24px = ~214px total) leave enough of the ~330-370px usable width for `.bartrack` to shrink into without the row overflowing (it should, since `.bartrack` has no minimum width and can compress to whatever space remains).
- `.calendargrid` (facilities page calendar): `repeat(7, 1fr)` with `aspect-ratio: 1` cells — confirm this renders as 7 narrow square cells rather than overflowing (narrow cells are an acceptable, not a broken, outcome for a prototype).

If every item above checks out with no overflow risk, no CSS changes are needed — do not invent speculative "improvements." If you find a genuine, concrete overflow or breakage (e.g., a fixed-width element with no flex/wrap/scroll escape hatch that would genuinely clip content at 360px), make the smallest possible targeted fix to that one rule and note exactly what you changed and why.

- [ ] **Step 2: Empty-state coverage check**

Confirm every dynamically-rendered list/table/chart across the app has a graceful "no data" fallback (not a blank table or a JavaScript error) when its underlying data is empty. Check each of these by reading the actual render function:

- `facilities.js` `renderresourcelist()` — empty state when filters match nothing.
- `bookings.js` `rendermybookings()`, `renderapprovals()`, `renderallbookings()` — empty state when there are no bookings / none pending.
- `maintenance.js` `rendermyreports()`, `rendertaskqueue()` — empty state when there are no tasks.
- `closures.js` `renderclosures()`, `renderaffectedbookings()` — empty state when there are no closures / no affected bookings.
- `reports.js` `renderbarchart()` — empty state when a chart's `counts` object is empty; `renderaudittable()` — empty state when the audit log (or a search) matches nothing.

If every one of these already has an `emptystate`-class fallback (they should, per each part's own implementation), no changes are needed. If you find one that's missing (renders a blank container/table body instead of a message), add a minimal empty-state branch matching the exact pattern already used by the other render functions in that same file (an `if (list.length === 0) { ...; return; }` guard producing a `<div class="emptystate">...</div>` or `<tr><td colspan="N" class="emptystate">...</td></tr>` row, consistent with that file's existing column count).

- [ ] **Step 3: Report and, if applicable, commit**

If Steps 1-2 found no issues, report that clearly — do not create an empty or cosmetic commit just to have something to show.

If a genuine fix was made, commit it with a message describing exactly what was fixed, for example:

```bash
git add styles.css
git commit -m "Fix mobile overflow in <specific component>"
```

(Substitute the actual file(s) changed and a message describing the actual fix made — do not use this exact placeholder text verbatim.)

---

### Task 3: Final push to GitHub

**Files:** none (git only)

- [ ] **Step 1: Push all Part 7 commits**

```bash
git push origin master
```

- [ ] **Step 2: Final verification on GitHub**

Confirm `README.md` is present at the repo root and renders as the repo's front page description. Confirm no `.claude`, `.superpowers`, or hyphenated/underscored filenames appear anywhere in the tree, and no commit messages carry a Claude/AI attribution trailer. List the full repo file tree as a final sanity check that all seven parts (foundation, facilities, bookings, maintenance, closures, reports, polish) are present and accounted for.
