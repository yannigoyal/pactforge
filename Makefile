.PHONY: dev

dev:
	@trap 'kill 0' EXIT INT TERM; \
	(cd backend && uv run uvicorn app.main:app --reload --port 8000) & \
	(cd frontend && npm run dev) & \
	wait
