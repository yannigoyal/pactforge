# pactForge backend

FastAPI backend for pactForge: health check, template-agnostic AI chat endpoint (Gemini), JWT auth, and per-user document persistence (SQLite).

## Commands

```bash
uv sync             # install dependencies
uv run uvicorn app.main:app --reload --port 8000   # start dev server
uv run pytest        # run tests
```

## Endpoints

- `GET /health` — health check
- `POST /chat` — AI chat assistant; requires `GEMINI_API_KEY` in `.env` (copy `.env.example`), returns 503 without it. The request carries the template name and a field-descriptor list, so it works for any template with no backend changes.
- `POST /auth/register`, `POST /auth/login` — email/password, both return `{token, email}` (JWT, 7-day expiry)
- `GET /auth/me` — current user (Bearer token)
- `GET/POST /documents`, `GET/PUT/DELETE /documents/{id}` — saved documents, auth-required, scoped to the current user

## Structure

- `app/main.py` — FastAPI app, CORS, lifespan (creates DB tables), router registration
- `app/core/config.py` — settings (CORS origins, Gemini API key/model, `DATABASE_URL`, `JWT_SECRET`)
- `app/core/auth.py` — password hashing, JWT create/validate, `get_current_user` dependency
- `app/api/routes/` — route modules, one per resource
- `app/services/` — business logic called by routes (e.g. `doc_chat.py` builds the system prompt/tool schema from the request's field descriptors and calls the Gemini API)
- `app/db/session.py` — SQLAlchemy engine/session (SQLite file `pactforge.db` by default, gitignored)
- `app/models/` — ORM models (`User`, `Document`)
- `tests/` — pytest tests; `conftest.py` overrides the DB with in-memory SQLite so tests never touch the real database
