# pactForge backend

FastAPI backend for pactForge. v1 foundation: health check only, no real endpoints yet.

## Commands

```bash
uv sync             # install dependencies
uv run uvicorn app.main:app --reload --port 8000   # start dev server
uv run pytest        # run tests
```

Health check: `GET http://localhost:8000/health`

## Structure

- `app/main.py` — FastAPI app, CORS, router registration
- `app/core/config.py` — settings (app name, CORS origins)
- `app/api/routes/` — route modules, one per resource
- `tests/` — pytest tests

## Future extension points

- Auth: add a dependency (e.g. `app/core/auth.py` with a `get_current_user` dependency) and wire it into protected routes. No auth exists yet — this is a placeholder foundation only.
- Database: add `app/db/` (session/engine setup) and `app/models/` (ORM models) when persistence is needed.
