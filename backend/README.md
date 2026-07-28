# pactForge backend

FastAPI backend for pactForge: a health check, and a template-agnostic AI chat endpoint that proxies to Gemini for the document chat assistant.

## Commands

```bash
uv sync             # install dependencies
uv run uvicorn app.main:app --reload --port 8000   # start dev server
uv run pytest        # run tests
```

Health check: `GET http://localhost:8000/health`

Chat endpoint: `POST http://localhost:8000/chat` — requires `GEMINI_API_KEY` set in `.env` (copy `.env.example`); without it, the endpoint returns a 503. The request carries the template name and a field-descriptor list, so the endpoint works for any template with no backend changes.

## Structure

- `app/main.py` — FastAPI app, CORS, router registration
- `app/core/config.py` — settings (app name, CORS origins, Gemini API key/model)
- `app/api/routes/` — route modules, one per resource
- `app/services/` — business logic called by routes (e.g. `doc_chat.py` builds the system prompt/tool schema from the request's field descriptors and calls the Gemini API)
- `tests/` — pytest tests

## Future extension points

- Auth: add a dependency (e.g. `app/core/auth.py` with a `get_current_user` dependency) and wire it into protected routes. No auth exists yet — this is a placeholder foundation only.
- Database: add `app/db/` (session/engine setup) and `app/models/` (ORM models) when persistence is needed.
