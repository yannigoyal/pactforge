# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

pactForge is an AI-powered workspace for drafting and managing business legal agreements. The current implementation is a Next.js app (`frontend/`) that lets a user fill out a form, preview a Bonterms Mutual NDA live, and download it as a PDF, plus a FastAPI backend (`backend/`) that is currently a v1 foundation (health check only — not yet wired into the NDA generation flow, which remains entirely within `frontend/`). The project is early-stage — the NDA creator is the first concrete feature; more agreement types/features and real backend endpoints are expected to follow.

## Repo layout

- `frontend/` — the Next.js (App Router) application. All NDA creator application code lives here.
- `backend/` — FastAPI service. v1 foundation only: `GET /health`, CORS configured for `http://localhost:3000`, scalable folder structure (`app/core`, `app/api/routes`) ready for future endpoints/auth/database. See `backend/README.md`.
- `templates/` — canonical legal document templates, source-controlled independently of the app.
  - `templates/catalog.json` — metadata index of available templates (id, category, source repo/commit, license).
  - `templates/<template-id>/` — one directory per template, each imported as-is from its upstream source (e.g. `bonterms-mutual-nda/Mutual-NDA.md`) with its own `LICENSE.md` and `README.md`. Do not hand-edit imported template text; if it needs to change, re-import from upstream and update the `source.commit` in `catalog.json`.

## Commands

```bash
make dev         # runs frontend (npm run dev) and backend (uvicorn --reload) together
```

Frontend commands run from `frontend/`:

```bash
npm run dev      # start dev server (http://localhost:3000)
npm run build    # production build
npm run start    # run production build
npm run lint     # ESLint (eslint-config-next, flat config)
```

Backend commands run from `backend/` (uses `uv`):

```bash
uv run uvicorn app.main:app --reload --port 8000   # start dev server (http://localhost:8000)
uv run pytest                                        # run backend tests
```

There is no root-level package.json — always `cd frontend` (or use `npm --prefix frontend`) before running npm scripts. There is no frontend test suite yet; the backend has a minimal pytest suite starting with `tests/test_health.py`.

## Architecture: NDA creator flow

The flow is: **markdown template → parsed blocks → shared by live preview and PDF renderer**, driven by a single react-hook-form + zod schema.

1. `lib/nda/markdown.ts` — `loadNdaBodyMarkdown()` reads the canonical NDA body directly from `../templates/bonterms-mutual-nda/Mutual-NDA.md` (relative to `frontend/`, resolved via `process.cwd()`), i.e. the templates directory is the single source of truth, not a copy under `frontend/`. `parseNdaBody()` parses that fixed markdown structure (headings, numbered items, `(a)`-style subitems, inline bold/italic/links, footer) into a `NdaBlock[]` tree. This parser is intentionally tailored to the Bonterms NDA's specific markdown shape, not general-purpose markdown.
2. `lib/nda/schema.ts` — `ndaFormSchema` (zod) defines all form fields, including a `partySchema` shared by both parties, with a refinement requiring each party to provide an email or postal address. `lib/nda/defaultValues.ts` provides the RHF default values matching this schema.
3. `app/page.tsx` — a server component that loads the markdown and parses it at request time, then renders `NdaCreator` with the parsed `bodyBlocks`.
4. `components/nda/NdaCreator.tsx` — client component owning the react-hook-form instance (`zodResolver(ndaFormSchema)`). Renders `NdaForm` (inputs) and `NdaPreview` (live-rendered blocks + form values) side by side, and handles PDF generation on submit.
5. `components/nda/NdaPdfDocument.tsx` and `@react-pdf/renderer` are dynamically imported inside the submit handler (not at module top level) to keep them out of the initial client bundle — preserve this pattern when adding similar heavy/optional dependencies.
6. `lib/nda/format.ts` — small presentation formatters (date formatting, signatory name+title, notice address) shared between the preview and the PDF document so the two renderings never drift apart. Add new shared formatting here rather than duplicating it in both components.

When adding a new agreement template, follow the same shape: drop the template markdown under `templates/<id>/`, register it in `templates/catalog.json`, and add a corresponding schema/markdown-parser/form/preview/PDF set under `frontend` if it needs its own creator flow.

## Conventions

- Path alias `@/*` maps to `frontend/` root (see `tsconfig.json`).
- Tailwind CSS v4 (via `@tailwindcss/postcss`) for styling; no CSS modules.
- Form components are client components (`"use client"`); markdown loading/parsing happens server-side in `app/page.tsx`.
