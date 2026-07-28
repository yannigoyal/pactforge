# pactForge

An AI-powered workspace for drafting and managing business legal agreements.

## Overview

pactForge aims to help teams draft, review, and manage business legal agreements faster by combining AI assistance with a structured workspace. It's built for founders, operators, and legal teams who need to move quickly on contracts without sacrificing rigor.

## Status

Early stage. The app (`frontend/`) offers multiple legal templates — currently the Bonterms Mutual NDA and Bonterms Professional Services Agreement — each fillable via an AI chat assistant or a form, with live preview and PDF download, backed by a FastAPI service (`backend/`) that proxies the chat assistant's AI calls.

## Planned features

- AI-assisted drafting of business agreements
- Centralized workspace for managing agreement lifecycle (draft, review, sign, store)
- Version history and redlining support
- Templates for common agreement types

## Repo layout

- `frontend/` — Next.js (App Router) app: NDA creator UI, live preview, PDF generation.
- `backend/` — FastAPI service. v1 foundation only (health check); future API endpoints and persistence will build on this.
- `templates/` — canonical legal document templates, source-controlled independently of the app.

## Getting started

```bash
make dev
```

Runs the frontend (`http://localhost:3000`) and backend (`http://localhost:8000`) together. See `frontend/README.md` and `backend/README.md` for running each separately.

## Contributing

Issues and pull requests are welcome. If you'd like to contribute, please open an issue first to discuss what you'd like to change.

## License

This project is licensed under the [MIT License](LICENSE).
