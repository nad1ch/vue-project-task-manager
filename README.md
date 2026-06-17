# Project & Task Manager

A Vue 3 + TypeScript single-page application for managing projects and their tasks,
with both a sortable/filterable data table and a Kanban board over the same data.
Built by Bohdan as a test assignment.

## Tech stack

Vue 3 (Composition API) · TypeScript (strict) · Pinia · Vue Router · Axios · SCSS · Vitest.
Data is served by an in-app mock API over `localStorage` — no backend required.

## Getting started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check and build for production |
| `npm run preview` | Preview the production build locally |
| `npm run type-check` | Run the TypeScript type checker (`vue-tsc`) |
| `npm run lint` | Run ESLint |
| `npm run format` | Format source with Prettier |
| `npm run test` | Run unit tests (Vitest) |

## Status

Project scaffold and architecture are in place. Feature implementation
(project CRUD, task table, Kanban, drag & drop), the mock API details, and the
live deploy link are being added incrementally and documented here as they land.

> An AI-assisted workflow was used for research and code review only.
