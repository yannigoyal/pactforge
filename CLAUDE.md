# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

pactForge is an AI-powered workspace for drafting and managing business legal agreements. The current implementation is a Next.js app (`frontend/`) where a user picks a template (Bonterms Mutual NDA or Bonterms Professional Services Agreement), fills it out either via a form or an AI chat assistant, previews it live, and downloads it as a PDF, backed by a FastAPI service (`backend/`) that proxies the chat assistant's calls to the Gemini API. The project is early-stage; more agreement types/features are expected to follow.

## Repo layout

- `frontend/` — the Next.js (App Router) application. All creator application code lives here.
- `backend/` — FastAPI service: `GET /health`, `POST /chat` (template-agnostic AI chat assistant, see below), CORS configured for `http://localhost:3000`, scalable folder structure (`app/core`, `app/api/routes`, `app/services`) ready for future endpoints/auth/database. See `backend/README.md`.
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

## Architecture: template creator flow

The flow is: **template picker → markdown template → parsed blocks → shared by live preview and PDF renderer**, driven per template by a react-hook-form + zod schema.

1. `app/page.tsx` — the template picker: a server component that reads `templates/catalog.json` (via `lib/templates/catalog.ts`) and renders a card per template linking to `/create/<templateId>`.
2. `app/create/[templateId]/page.tsx` — a server component that looks up the catalog entry (404 for unknown ids), loads and parses that template's markdown, and switches on the template id to render its creator (`NdaCreator` or `PsaCreator`). New templates are registered here.
3. `lib/templates/markdown.ts` — `loadTemplateMarkdown()` reads a template's canonical markdown directly from `../templates/<catalog path>` (resolved via `process.cwd()`), i.e. the templates directory is the single source of truth, not a copy under `frontend/`. `parseAgreementBody()` parses the fixed markdown shapes used by the Bonterms agreements (headings, `1.` and `**1.\tTitle**.` items, `2.1.` subsections, `(a)`-style subitems, inline bold/italic/links, footer) into a `DocBlock[]` tree. This parser is intentionally tailored to these templates, not general-purpose markdown.
4. `lib/templates/party.ts` and `lib/templates/format.ts` — the party schema (shared by both parties of both templates, with a refinement requiring an email or postal address) and presentation formatters shared between previews and PDF documents so the renderings never drift apart. Add new shared formatting here rather than duplicating it per component.
5. `components/shared/DocumentCreator.tsx` — generic client component owning the react-hook-form instance (`zodResolver(schema)`). Renders the chat + the template's form alongside its live preview, gates the Download PDF button on `formState.isValid`, and generates the PDF on submit via a per-template `createPdfBlob` callback. That callback dynamically imports `@react-pdf/renderer` and the template's PDF document (not at module top level) to keep them out of the initial client bundle — preserve this pattern.
6. Per-template sets follow one shape — `lib/<t>/schema.ts` + `defaultValues.ts` + `chatDescriptors.ts`, and `components/<t>/<T>Creator.tsx` (thin `DocumentCreator` wrapper) + `<T>Form.tsx` + `<T>Preview.tsx` + `<T>PdfDocument.tsx` — composing the shared pieces in `components/shared/` (`FormField`, `PartyFields`, `previewParts`, `pdfParts`). See `lib/nda`/`components/nda` and `lib/psa`/`components/psa`.

When adding a new agreement template: drop the template markdown under `templates/<id>/`, register it in `templates/catalog.json`, add a `lib/<t>` + `components/<t>` set following the shape above, and add the id → creator case in `app/create/[templateId]/page.tsx`. No backend changes are needed.

## Architecture: AI chat assistant

`components/shared/DocChat.tsx` runs alongside each template's form inside `DocumentCreator`, writing into the same `react-hook-form` instance via `setValue`, so chat-collected and form-typed data are one source of truth for the preview/PDF.

1. Each template declares its extractable fields as a `FieldDescriptor[]` (`path`, `label`, optional `options` for enum fields) in `lib/<t>/chatDescriptors.ts` — used both for the chat's question labels and the backend's extraction schema.
2. `lib/templates/chatFields.ts` — `getNextField()` reuses the template schema's `safeParse()` (rather than a duplicate validation path) to find the first invalid required field; once the form validates, it nudges once for the optional `additionalTerms` field.
3. `lib/templates/chat.ts` — `sendChatMessage()` posts the template name, field descriptors, transcript, current field values and next field to the backend; `applyExtractedFields()` maps the response's extracted fields onto `setValue`.
4. `backend/app/api/routes/chat.py` → `backend/app/services/doc_chat.py` — template-agnostic: builds a Gemini function declaration (`record_document_fields`) dynamically from the request's field descriptors, and filters extracted values against the declared descriptor paths so hallucinated fields are dropped.

`GEMINI_API_KEY` must be set in `backend/.env` for the chat to work; without it, `POST /chat` returns a 503 that the chat UI surfaces as a retryable error, while the form remains fully usable.

## Conventions

- Path alias `@/*` maps to `frontend/` root (see `tsconfig.json`).
- Tailwind CSS v4 (via `@tailwindcss/postcss`) for styling; no CSS modules.
- Form components are client components (`"use client"`); markdown loading/parsing happens server-side in `app/page.tsx`.
