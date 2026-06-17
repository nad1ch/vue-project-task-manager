# Project & Task Manager

A polished Vue 3 + TypeScript single-page application for managing projects and
their tasks. Projects and tasks are presented in a sortable, filterable, resizable
data table, and tasks can also be managed on a Kanban board — both views are driven
by the **same** Pinia store, so a change in one is reflected instantly in the other.

Built by Bohdan as a front-end test assignment. There is **no backend**: the app
ships with an Axios-based mock API backed by `localStorage`, so it runs entirely in
the browser and deploys as a static site.

> **Live demo:** _deploy-ready — see [Deployment](#deployment)._

---

## Features

- **Projects table** — columns `id`, `name`, `tasks count` (derived), `status`, `created`; sort on every column, text filter by name, status filter, resizable columns, create/edit/delete, row click → details.
- **Project details** — `/projects/:id`, resolved from the projects store (no per-id endpoint); a clear *not found* state for unknown ids.
- **Task table & Kanban** — one tasks store powers both. Table: sort, assignee/status filters, resizable columns. Kanban: exactly three columns (To Do / In Progress / Done).
- **Drag & drop** — reorder within a lane, move across columns (status + order in one action), and reorder table rows in the default order. DnD is disabled with a clear explanation while sorting/filters are active, so reordering is never ambiguous.
- **Validation** — `vee-validate` + `zod`; errors on blur and on submit; due date must be today-or-later when creating.
- **Persistence** — projects/tasks via the mock API, and view mode + sorting + filters + column widths via a separate preferences key. Everything survives a reload.
- **Product polish** — light/dark theme, toasts, skeletons, empty/error states, a dashboard with KPIs and a tasks-by-status chart, optimistic updates with rollback, and accessibility basics (semantic table with `aria-sort`, focus-trapped modals, labelled controls, status conveyed by text + colour).

## Tech stack

Vue 3 (Composition API, `<script setup>`) · TypeScript (strict, no `any`) · Vite ·
Pinia · Vue Router · Axios + `axios-mock-adapter` · `vee-validate` + `zod` ·
`vue-draggable-plus` · `chart.js` + `vue-chartjs` · SCSS · Vitest + Vue Test Utils.

## Getting started

Requires Node 20+ and npm.

```bash
npm install
npm run dev        # start the dev server (http://localhost:5173)
npm run build      # type-check + production build to dist/
npm run preview    # preview the production build
npm run test       # unit + component tests (Vitest)
npm run lint       # ESLint (fails on any use of `any`)
npm run type-check # vue-tsc, no emit
```

On first launch the mock database seeds a few projects and tasks so the app is
immediately usable.

## Architecture

The codebase is layered so responsibilities never leak across boundaries:

```
src/
  api/         generic typed Axios client, interceptor, normalized ApiError
  mock/        axios-mock-adapter + localStorage DB + seed (the only backend)
  services/    typed CRUD; validates with zod before writing; throws ApiError
  stores/      Pinia: projects, tasks, ui-preferences, toast
  composables/ reusable UI/interaction logic (sort, resize, dnd, persisted ref…)
  lib/         pure helpers (date, compare, reorder) + zod validation schemas
  types/       canonical types, enums and DTOs
  components/  presentational/composite UI (ui, table, kanban, task, dashboard…)
  pages/       route-level orchestration
  router/      routes only
  styles/      design tokens, reset, typography, mixins
```

**Data flow:** component → store action → service → api → mock adapter → `localStorage`.
Components never call Axios or touch `localStorage` directly, and never contain HTTP
`try/catch`.

Key decisions:

- **One source of truth for tasks.** The table and Kanban both render derived views
  of a single `items` array in `useTasksStore`. Moving a card on the board and
  reordering a row in the table go through the same store actions, so the two views
  cannot drift.
- **`tasksCount` is derived, not stored.** It is computed from the tasks store per
  project — the mock database never stores a count on a project.
- **Errors live in the service layer.** The Axios interceptor normalizes every
  failure to a typed `ApiError`; services throw it; store actions are the single
  place that catch it, roll back optimistic changes and raise a toast.
- **Numeric IDs, exact enums.** `ProjectStatus` is `active | archived`; `TaskStatus`
  is `todo | in_progress | done`. No extra statuses, no priority, no string IDs.
- **Custom, token-driven components.** UI primitives, the data table and the board
  are built in-house against a single design-token system. This keeps the table
  sorting/filtering/resize and the DnD synchronisation explicit and testable, and
  gives a cohesive light/dark theme rather than an inverted one.

## Mock API

There is no server. `src/mock` mounts `axios-mock-adapter` on the shared Axios
instance and serves data from `localStorage` with a simulated 150–300 ms latency.
An optional fault rate (`VITE_MOCK_FAULT_RATE`, default `0`) can randomly fail
requests to exercise error states.

| Method | Endpoint | Notes |
| --- | --- | --- |
| GET | `/projects` | list all projects |
| POST | `/projects` | create; server assigns id + timestamps |
| PUT | `/projects/:id` | update; 404 for unknown id |
| DELETE | `/projects/:id` | delete + **cascade** its tasks |
| GET | `/tasks?projectId=` | tasks for a project |
| POST | `/tasks` | create; appends to its lane order |
| PUT | `/tasks/:id` | update (also status/order changes from DnD) |
| DELETE | `/tasks/:id` | delete |

`GET /tasks` with no `projectId` returns all tasks — a **mock convenience** used by
the dashboard and the projects table's derived counts, not a required backend
endpoint.

### localStorage keys & reset

| Key | Contents |
| --- | --- |
| `tms.db.projects` | project records |
| `tms.db.tasks` | task records |
| `tms.db.meta` | schema version + id sequence |
| `tms.ui.prefs` | view mode, sorting, filters, column widths, theme |

To reset to seed data, clear those keys (or run `localStorage.clear()` in the
console) and reload. Reads are guarded, so corrupt storage falls back safely
instead of crashing.

## Quality gates

- `type-check` — `vue-tsc` passes with zero errors under `strict` + `noUncheckedIndexedAccess`.
- `lint` — ESLint passes; `@typescript-eslint/no-explicit-any` is an error.
- `test` — Vitest covers helpers, validation schemas, the mock API, services,
  stores, DnD/reorder logic, and a page render smoke test.
- `build` — produces a static `dist/` that runs with no backend.

## Deployment

Static SPA — any static host works. The repo includes `vercel.json` with an SPA
rewrite so deep links such as `/projects/1` resolve on refresh.

**Deploy to Vercel:**

```bash
npm i -g vercel
vercel            # link the project (framework preset: Vite)
vercel --prod     # production deploy
```

Or import the GitHub repository at vercel.com → New Project (Vite is auto-detected,
build `npm run build`, output `dist`). Netlify works the same way; for GitHub Pages,
set a base path and add a `404.html` SPA fallback.

## Known limitations

- Single user, single browser — data lives only in this browser's `localStorage`.
- No real persistence/auth; the mock API simulates a backend for the assignment.
- No real-time sync across tabs (preferences sync, entity data does not).

---

_An AI-assisted workflow was used for research and code review only; the
implementation and engineering decisions are the author's own._
